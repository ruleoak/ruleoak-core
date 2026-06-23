import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  AgentActionReplay,
  AgentFirewall,
  FlightRecorder,
  McpPermissionGateway,
  OpenClawSafetyShield
} from "../../src/agentic/index.js";

const outDir = join(process.cwd(), "examples", "agentic-foundation", "out");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const evidencePath = join(outDir, "agentic-evidence.jsonl");
const recorder = new FlightRecorder({ runId: "demo-agentic-foundation", sessionId: "demo-session", filePath: evidencePath, actor: "demo-agent" });
recorder.startRun({ demo: "RuleOak Agentic Foundation Ideas 1-5" });

const firewall = new AgentFirewall({
  recorder,
  policy: {
    allowedActions: ["search.read"],
    approvalRequired: ["email.send"],
    blockedActions: ["filesystem.delete", "shell.execute"],
    boundary: "local_first_agentic_demo"
  }
});

await firewall.guardAction({ actionId: "search-1", toolName: "search", operation: "read", input: { query: "RuleOak" } }, async () => ({ results: 2 }));
await firewall.guardAction({ actionId: "email-1", toolName: "email", operation: "send", input: { to: "team@example.com", body: "Demo" } }, async () => ({ sent: true }));
await firewall.guardAction({ actionId: "delete-1", toolName: "filesystem", operation: "delete", input: { path: "/important/file.txt" } }, async () => ({ deleted: true }));

const shield = new OpenClawSafetyShield({ recorder, firewall });
await shield.handleAction({ id: "openclaw-shell-1", type: "shell_run", command: "rm -rf /" });

const gateway = new McpPermissionGateway({
  recorder,
  policy: { allowedActions: ["search_docs"], blockedActions: ["delete_file"], approvalRequired: ["send_email"] },
  server: {
    name: "demo-mcp-server",
    tools: [
      { name: "search_docs", description: "Read and search docs", inputSchema: { type: "object" } },
      { name: "delete_file", description: "Delete a file", inputSchema: { type: "object" } },
      { name: "send_email", description: "Send email", inputSchema: { type: "object" } }
    ]
  }
});
gateway.inspect();
await gateway.callTool({ name: "search_docs", arguments: { q: "flight recorder" } });
await gateway.callTool({ name: "delete_file", arguments: { path: "/tmp/x" } });

recorder.finishRun({ status: "completed" });

const replay = new AgentActionReplay({ filePath: evidencePath });
console.log(replay.toText());
console.log(`\nEvidence written to: ${evidencePath}`);
