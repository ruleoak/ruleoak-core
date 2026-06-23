import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AgentDryRunMode,
  ApprovalLinkProtocol,
  FlightRecorder,
  LocalApprovalStore,
  LocalEvidenceVault,
  ToolRiskScanner,
  badgeLevelReport,
  calculateAgentTrustScore,
  compileRuleOakPolicyFromPrompt,
  constitutionPackToManifest,
  dryRunAction,
  evidenceEventToJsonl,
  filterToolsForLeastPrivilege,
  generateAgentIncidentReport,
  generateRuleOakBadgeMarkdown,
  generateRuleOakManifestSummary,
  getAgentConstitutionPack,
  listAgentConstitutionPacks,
  mergeAgentConstitutionPacks,
  normalizeEvidenceEvent,
  parseRuleOakManifestText,
  renderAgentTrustScoreMarkdown,
  renderCompiledPolicyYaml,
  renderMcpCatalogScanMarkdown,
  runAgentSafetyCi,
  scanMcpToolCatalog,
  scanToolRisks,
  validateEvidenceEvent,
  validateEvidenceJsonlText,
  validateRuleOakManifest,
  verifyRuleOakBadgeClaim
} from "../src/agentic/index.js";

const fixedClock = (() => {
  let tick = 0;
  return () => `2026-06-21T01:00:${String(++tick).padStart(2, "0")}.000Z`;
})();

function sampleManifest() {
  return {
    version: "ruleoak.manifest.v1",
    project: { name: "agentic-test" },
    agent: { name: "test-agent", runtime: "mock" },
    permissions: {
      allowedActions: ["search.read"],
      approvalRequired: ["email.send"],
      blockedActions: ["filesystem.delete", "shell.execute"],
      dryRunOnly: ["browser.purchase"]
    },
    tools: [
      { name: "search.read", description: "Read and search docs", inputSchema: { type: "object" } },
      { name: "email.send", description: "Send email", inputSchema: { type: "object" } },
      { name: "filesystem.delete", description: "Delete file", inputSchema: { type: "object" } }
    ],
    evidence: { enabled: true, format: "jsonl", replayable: true },
    redaction: { enabled: true }
  };
}

async function testManifestBadgePolicyAndCi() {
  const text = `version: ruleoak.manifest.v1\nproject:\n  name: demo\nagent:\n  name: demo-agent\npermissions:\n  allowedActions:\n    - search.read\n  approvalRequired:\n    - email.send\n  blockedActions:\n    - filesystem.delete\nevidence:\n  enabled: true\n  format: jsonl\n  replayable: true\nredaction:\n  enabled: true\n`;
  const parsed = parseRuleOakManifestText(text);
  const validation = validateRuleOakManifest(parsed);
  assert.equal(validation.ok, true);
  assert(generateRuleOakManifestSummary(parsed).includes("RuleOak Manifest Summary"));
  assert(generateRuleOakBadgeMarkdown("approval-gated").includes("img.shields.io"));
  assert.equal(verifyRuleOakBadgeClaim("replayable", parsed).ok, true);
  assert.equal(badgeLevelReport(parsed).length, 4);

  const compilation = compileRuleOakPolicyFromPrompt("No shell.execute without approval. Block filesystem.delete. Allow search.read. Dry run only for browser.purchase.");
  assert.equal(compilation.ok, true);
  assert.deepEqual(compilation.policy.approvalRequired, ["shell.execute"]);
  assert(renderCompiledPolicyYaml(compilation).includes("approvalRequired"));

  const dir = mkdtempSync(join(tmpdir(), "ruleoak-ci-"));
  try {
    const manifestPath = join(dir, ".ruleoak.yml");
    writeFileSync(manifestPath, text, "utf8");
    const ci = runAgentSafetyCi({ manifestPath, tools: parsed.tools || [] });
    assert.equal(ci.ok, true);
    assert.equal(ci.exitCode, 0);
    assert(ci.markdown.includes("RuleOak Agent Safety CI"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function testEvidenceFormatScannerFilterApprovalAndDryRun() {
  const event = normalizeEvidenceEvent({ type: "run_started", payload: { purpose: "test" } }, { runId: "run-x", sessionId: "s-x", eventId: "evt-x", timestamp: "2026-06-21T00:00:00.000Z" });
  assert.equal(validateEvidenceEvent(event).ok, true);
  assert(evidenceEventToJsonl(event).endsWith("\n"));
  assert.equal(validateEvidenceJsonlText(evidenceEventToJsonl(event)).ok, true);

  const tools = [
    { name: "search.read", description: "Read and search documents", capabilities: ["search"], inputSchema: { type: "object" } },
    { name: "shell.execute", description: "Run shell command", capabilities: ["shell"], inputSchema: { type: "object" } },
    { name: "email.send", description: "Send an email", capabilities: ["email"], inputSchema: { type: "object" } }
  ];
  const scan = scanToolRisks(tools);
  assert.equal(scan.counts.total, 3);
  assert.equal(scan.results.find((r) => r.name === "shell.execute").risk, "high");
  assert(new ToolRiskScanner().renderMarkdown(scan).includes("Tool Risk Scan"));

  const recorder = new FlightRecorder({ runId: "run-filter", clock: fixedClock });
  const filtered = filterToolsForLeastPrivilege({ task: { requiredCapabilities: ["search"] }, tools, policy: { blockedActions: ["shell.execute"], approvalRequired: ["email.send"] }, recorder });
  assert.deepEqual(filtered.allowedTools.map((t) => t.name), ["search.read"]);
  assert(recorder.list().some((e) => e.type === "tool_filter_decision"));

  const approval = new ApprovalLinkProtocol({ store: new LocalApprovalStore(), recorder, clock: fixedClock });
  const request = approval.createRequest({ actionId: "mail", toolName: "email", operation: "send", apiKey: "SHOULD_NOT_LEAK" }, { risk: "medium" });
  assert.equal(request.status, "pending");
  const decided = approval.decide(request.approvalId, { decision: "edit", editedAction: { actionId: "mail", toolName: "email", operation: "send", body: "edited" } });
  assert.equal(decided.status, "approved");
  assert.equal(approval.canProceed(request.approvalId), true);

  const dry = await dryRunAction({ actionId: "del", toolName: "filesystem", operation: "delete", target: "/tmp/x" }, { policy: { blockedActions: ["filesystem.delete"] }, recorder, simulators: { filesystem: () => ({ wouldDelete: "/tmp/x" }) } });
  assert.equal(dry.realSideEffectsExecuted, false);
  assert.equal(dry.label, "simulation only");
  const dryMode = new AgentDryRunMode({ recorder });
  const preview = await dryMode.preview({ actionId: "s", toolName: "search", operation: "read" });
  assert.equal(preview.realSideEffectsExecuted, false);
}

async function testReportsVaultMcpTrustAndPacks() {
  const recorder = new FlightRecorder({ runId: "run-report", clock: fixedClock });
  recorder.startRun({ ok: true });
  recorder.record("action_requested", { actionId: "a1", toolName: "shell", operation: "execute" });
  recorder.record("policy_decision", { actionId: "a1", toolName: "shell", decision: "deny", risk: "high" });
  recorder.finishRun({ ok: true });
  const events = recorder.list();

  const report = generateAgentIncidentReport(events, { incidentId: "inc-1" });
  assert.equal(report.severity, "review_required");
  assert(report.markdown.includes("Denied actions"));
  assert(report.html.includes("RuleOak Agent Incident Report"));

  const vault = new LocalEvidenceVault({ events });
  assert.equal(vault.summary().counts.total, events.length);
  assert.equal(vault.search({ decision: "deny" }).length, 1);
  assert.equal(vault.redactionCheck().ok, true);

  const catalogScan = scanMcpToolCatalog({ servers: [{ name: "demo", tools: [{ name: "delete_file", description: "Delete local file", inputSchema: { type: "object" } }, { name: "lookup", description: "Read lookup records", inputSchema: { type: "object" } }] }] });
  assert.equal(catalogScan.ok, false);
  assert(renderMcpCatalogScanMarkdown(catalogScan).includes("MCP Catalog Scan"));

  const manifest = sampleManifest();
  const trust = calculateAgentTrustScore({ manifest, tools: manifest.tools, replaySupported: true, safetyCi: { ok: true } });
  assert(trust.score >= 80);
  assert(renderAgentTrustScoreMarkdown(trust).includes("Agent Trust Score"));

  assert(listAgentConstitutionPacks().length >= 7);
  assert(getAgentConstitutionPack("coding-agent").blockedActions.includes("credential.read"));
  const merged = mergeAgentConstitutionPacks(["research-agent", "coding-agent"]);
  assert(merged.permissions.blockedActions.includes("credential.read"));
  const packManifest = constitutionPackToManifest("sre-production");
  assert.equal(validateRuleOakManifest(packManifest).ok, true);
}

await testManifestBadgePolicyAndCi();
await testEvidenceFormatScannerFilterApprovalAndDryRun();
await testReportsVaultMcpTrustAndPacks();
console.log("agentic-ecosystem.test.js passed");
