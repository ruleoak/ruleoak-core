import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AgentFirewall,
  FlightRecorder,
  JsonlEvidenceSink,
  AgentDryRunMode,
  ApprovalLinkProtocol,
  LocalApprovalStore,
  AgentActionReplay,
  renderTimelineMarkdown,
  generateAgentIncidentReport,
  renderIncidentReportMarkdown
} from "../../src/agentic/index.js";

const outDir = resolve("examples/public-agentic-demo/out");
mkdirSync(outDir, { recursive: true });
const evidencePath = resolve(outDir, "public-demo-evidence.jsonl");
writeFileSync(evidencePath, "", "utf8");
const recorder = new FlightRecorder({
  runId: "public-agentic-demo",
  sessionId: "public-demo-session",
  actor: "demo-agent",
  sink: new JsonlEvidenceSink(evidencePath)
});
const firewall = new AgentFirewall({
  recorder,
  policy: {
    allowedActions: ["search_docs"],
    approvalRequired: ["send_email", "run_shell"],
    blockedActions: ["delete_file", "read_secret"]
  }
});
const approval = new ApprovalLinkProtocol({ store: new LocalApprovalStore(), baseUrl: "http://127.0.0.1:8790/approve" });
const dryRun = new AgentDryRunMode({ firewall, recorder });

recorder.startRun({ title: "Dangerous action demo" });
await firewall.guardAction({ toolName: "search_docs", operation: "read", input: { query: "release checklist" } }, async () => ({ hits: 3 }));
await dryRun.preview({ toolName: "send_email", operation: "send", input: { to: "wrong@example.com", subject: "Sensitive draft", token: "sk-demo-secret" } });
const request = approval.createRequest({ toolName: "send_email", operation: "send", risk: "high", reason: "external message" });
recorder.record("approval_requested", { actionId: request.actionId, approvalUrl: request.url, status: "pending" });
await firewall.guardAction({ toolName: "delete_file", operation: "delete", target: "customer-data.csv" }, async () => ({ deleted: true }));
await firewall.guardAction({ toolName: "run_shell", operation: "execute", input: { command: "rm -rf /" } }, async () => ({ code: 0 }));
await firewall.guardAction({ toolName: "read_secret", operation: "read", input: { key: "OPENAI_API_KEY" } }, async () => ({ value: "secret" }));
recorder.finishRun({ status: "completed_with_controls" });

const replay = new AgentActionReplay({ events: recorder.list() });
const timeline = replay.timeline();
writeFileSync(resolve(outDir, "public-demo-replay.md"), renderTimelineMarkdown(timeline, { title: "Public Agentic Demo Replay" }), "utf8");
const incident = generateAgentIncidentReport(recorder.list(), { title: "Public Agentic Demo Incident Report" });
writeFileSync(resolve(outDir, "public-demo-incident-report.md"), renderIncidentReportMarkdown(incident), "utf8");
console.log("RuleOak public agentic demo complete");
console.log("Safe action allowed; risky actions paused; destructive actions blocked; evidence replay generated.");
console.log(`Evidence: ${evidencePath}`);
