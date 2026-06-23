import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AgentActionReplay,
  AgentFirewall,
  FlightRecorder,
  McpPermissionGateway,
  OpenClawSafetyShield,
  readEvidenceJsonl,
  renderTimelineMarkdown,
  renderTimelineText
} from "../src/agentic/index.js";

const fixedClock = (() => {
  let tick = 0;
  return () => `2026-06-21T00:00:${String(++tick).padStart(2, "0")}.000Z`;
})();

async function testFlightRecorderJsonlAndRedaction() {
  const dir = mkdtempSync(join(tmpdir(), "ruleoak-agentic-"));
  try {
    const filePath = join(dir, "evidence.jsonl");
    const recorder = new FlightRecorder({ runId: "run-flight", sessionId: "session-flight", filePath, clock: fixedClock });
    recorder.startRun({ prompt: "test", apiKey: "SHOULD_NOT_APPEAR" });
    await recorder.wrapAction({ actionId: "a1", toolName: "search", operation: "read", input: { Authorization: "Bearer abc123secret" } }, async () => ({ ok: true, token: "SHOULD_NOT_APPEAR" }));
    recorder.finishRun({ status: "ok" });

    const lines = readFileSync(filePath, "utf8").trim().split(/\n/);
    assert.equal(lines.length, 4);
    assert(!readFileSync(filePath, "utf8").includes("SHOULD_NOT_APPEAR"));
    assert(!readFileSync(filePath, "utf8").includes("abc123secret"));
    const events = readEvidenceJsonl(filePath);
    assert.deepEqual(events.map((event) => event.type), ["run_started", "action_requested", "action_executed", "run_finished"]);
    assert.equal(events[1].payload.actionId, "a1");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function testAgentFirewallDecisionsAndExecution() {
  const recorder = new FlightRecorder({ runId: "run-firewall", sessionId: "session-firewall", clock: fixedClock });
  const firewall = new AgentFirewall({
    recorder,
    policy: {
      allowedActions: ["search", "search.read"],
      approvalRequired: ["email.send"],
      blockedActions: ["filesystem.delete", "shell.execute"]
    }
  });

  const allowed = await firewall.guardAction({ actionId: "read1", toolName: "search", operation: "read" }, async () => ({ found: 1 }));
  assert.equal(allowed.decision.decision, "allow");
  assert.equal(allowed.executed, true);

  const approval = await firewall.guardAction({ actionId: "mail1", toolName: "email", operation: "send" }, async () => ({ sent: true }));
  assert.equal(approval.decision.decision, "needs_approval");
  assert.equal(approval.executed, false);

  const denied = await firewall.guardAction({ actionId: "delete1", toolName: "filesystem", operation: "delete" }, async () => ({ deleted: true }));
  assert.equal(denied.decision.decision, "deny");
  assert.equal(denied.executed, false);

  const report = firewall.report();
  assert.equal(report.counts.allowed, 1);
  assert.equal(report.counts.approvalRequired, 1);
  assert.equal(report.counts.blocked, 1);
  assert(recorder.list().some((event) => event.type === "approval_requested"));
}

async function testOpenClawSafetyShield() {
  const shield = new OpenClawSafetyShield({ runId: "run-openclaw", clock: fixedClock });
  const results = await shield.handleActions([
    { id: "ctx1", type: "read_context", target: "notes" },
    { id: "email1", type: "email_send", to: "person@example.com", payload: { body: "hello" } },
    { id: "file1", type: "file_delete", path: "/important.txt" },
    { id: "shell1", type: "shell_run", command: "rm -rf /" }
  ]);

  assert.equal(results[0].decision.decision, "allow");
  assert.equal(results[1].decision.decision, "needs_approval");
  assert.equal(results[2].decision.decision, "deny");
  assert.equal(results[3].decision.decision, "deny");
  const report = shield.report();
  assert.equal(report.runtimeStage, "openclaw-style-safety-shield");
  assert.equal(report.actionCount, 4);
}

async function testMcpPermissionGateway() {
  const gateway = new McpPermissionGateway({
    runId: "run-mcp-gateway",
    clock: fixedClock,
    server: {
      name: "demo-mcp",
      version: "1.0.0",
      tools: [
        { name: "search_docs", description: "Read and search documents", inputSchema: { type: "object" } },
        { name: "delete_file", description: "Delete a local file", inputSchema: { type: "object" } },
        { name: "send_email", description: "Send external email", inputSchema: { type: "object" } }
      ]
    },
    policy: { allowedActions: ["search_docs"], approvalRequired: ["send_email"], blockedActions: ["delete_file"] }
  });

  const inventory = gateway.inspect();
  assert.equal(inventory.toolCount, 3);
  assert.equal(inventory.tools.find((tool) => tool.name === "delete_file").risk, "high");

  const allowed = await gateway.callTool({ name: "search_docs", arguments: { query: "ruleoak" } });
  assert.equal(allowed.executed, true);

  const approval = await gateway.callTool({ name: "send_email", arguments: { to: "user@example.com" } });
  assert.equal(approval.executed, false);
  assert.equal(approval.decision.decision, "approval_required");

  const denied = await gateway.handleJsonRpc({ jsonrpc: "2.0", id: "x1", method: "tools/call", params: { name: "delete_file", arguments: { path: "/tmp/a" } } });
  assert.equal(denied.error.code, -32003);

  const listResponse = await gateway.handleJsonRpc({ jsonrpc: "2.0", id: "x2", method: "tools/list" });
  assert.equal(listResponse.result.toolCount, 3);
}

async function testActionReplay() {
  const recorder = new FlightRecorder({ runId: "run-replay", sessionId: "session-replay", clock: fixedClock });
  const firewall = new AgentFirewall({ recorder, policy: { allowedActions: ["search.read"], blockedActions: ["filesystem.delete"] } });
  await firewall.guardAction({ actionId: "r1", toolName: "search", operation: "read" }, async () => ({ ok: true }));
  await firewall.guardAction({ actionId: "r2", toolName: "filesystem", operation: "delete" }, async () => ({ deleted: true }));

  const replay = new AgentActionReplay({ events: recorder.list() });
  const timeline = replay.timeline();
  assert(timeline.length >= 5);
  assert(timeline.some((event) => event.actionId === "r1" && event.type === "action_executed"));
  assert(timeline.some((event) => event.actionId === "r2" && event.decision === "deny"));
  assert(renderTimelineText(timeline).includes("RuleOak Agent Action Replay"));
  assert(renderTimelineMarkdown(timeline).includes("| # | Time | Type | Action | Tool | Decision | Risk | Summary |"));
  assert.equal(replay.timeline({ decision: "deny" }).length, 1);
}

await testFlightRecorderJsonlAndRedaction();
await testAgentFirewallDecisionsAndExecution();
await testOpenClawSafetyShield();
await testMcpPermissionGateway();
await testActionReplay();
console.log("agentic-foundation.test.js passed");
