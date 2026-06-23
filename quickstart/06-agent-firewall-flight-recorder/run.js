import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  AgentFirewall,
  AgentActionReplay,
  FlightRecorder,
  JsonlEvidenceSink,
  renderTimelineMarkdown,
  readEvidenceJsonl
} from "../../src/agentic/index.js";

const outDir = resolve("quickstart/out");
mkdirSync(outDir, { recursive: true });
const evidencePath = resolve(outDir, "agentic-evidence.jsonl");
writeFileSync(evidencePath, "", "utf8");

const recorder = new FlightRecorder({
  runId: "quickstart-agentic-run",
  sessionId: "quickstart-session",
  actor: "demo-agent",
  sink: new JsonlEvidenceSink(evidencePath),
  clock: (() => {
    let i = 0;
    return () => new Date(Date.UTC(2026, 0, 1, 0, 0, i++)).toISOString();
  })()
});

const firewall = new AgentFirewall({
  recorder,
  policy: {
    allowedActions: ["search_docs"],
    approvalRequired: ["send_email"],
    blockedActions: ["delete_file"]
  }
});

recorder.startRun({ title: "RuleOak agentic quickstart" });
await firewall.guardAction(
  { toolName: "search_docs", operation: "read", input: { query: "RuleOak Agent Firewall" } },
  async () => ({ ok: true, results: ["local-readme", "local-docs"] })
);
await firewall.guardAction(
  { toolName: "send_email", operation: "send", input: { to: "external@example.com", subject: "Approval needed" } },
  async () => ({ sent: true })
);
await firewall.guardAction(
  { toolName: "delete_file", operation: "delete", target: "important.md", input: { path: "important.md" } },
  async () => ({ deleted: true })
);
recorder.finishRun({ status: "completed" });

const events = readEvidenceJsonl(evidencePath);
const replay = new AgentActionReplay({ events });
const timeline = replay.timeline();
const replayMarkdown = renderTimelineMarkdown(timeline, { title: "RuleOak Agentic Quickstart Replay" });
const replayPath = resolve(outDir, "agentic-replay.md");
writeFileSync(replayPath, replayMarkdown, "utf8");

console.log("RuleOak agentic quickstart completed");
console.log(`Evidence: ${evidencePath}`);
console.log(`Replay:   ${replayPath}`);
console.log(`Events:   ${events.length}`);
console.log("Decisions: allow=1 approval_required=1 deny=1");
