import { AgentFirewall, FlightRecorder, AgentActionReplay } from "../../../src/agentic/index.js";

const recorder = new FlightRecorder({ runId: "adapter-any-agent", actor: "demo-agent" });
const firewall = new AgentFirewall({
  recorder,
  policy: {
    allowedActions: ["search.read", "llm.generate", "python.call"],
    approvalRequired: ["email.send", "calendar.update"],
    blockedActions: ["filesystem.delete", "shell.execute", "credential.read"]
  }
});

recorder.startRun({ sample: "any-agent" });
await firewall.guardAction({ actionId: "safe", toolName: "search", operation: "read", input: { q: "ruleoak" } }, async () => ({ ok: true, result: "safe lookup" }));
await firewall.guardAction({ actionId: "blocked", toolName: "filesystem", operation: "delete", target: "/tmp/important" }, async () => ({ deleted: true }));
recorder.finishRun({ ok: true });
console.log(new AgentActionReplay({ events: recorder.list() }).toText());
