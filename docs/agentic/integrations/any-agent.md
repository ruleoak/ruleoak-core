# Integrate RuleOak with any agent

Use RuleOak at the action boundary: after the model proposes a tool call and before your application executes that tool.

```js
import { AgentFirewall, FlightRecorder, AgentActionReplay } from "@ruleoak/core/agentic";

const recorder = new FlightRecorder({ filePath: "./ruleoak-evidence.jsonl" });
const firewall = new AgentFirewall({
  recorder,
  policy: {
    allowedActions: ["search_docs"],
    approvalRequired: ["send_email"],
    blockedActions: ["delete_file"]
  }
});

await firewall.guardAction(
  { toolName: "search_docs", operation: "read", input: { query: "RuleOak" } },
  async () => ({ ok: true, results: ["local fixture"] })
);
```

Minimum integration checklist:

1. Build a normalized action envelope.
2. Pass it through `AgentFirewall`.
3. Execute only if RuleOak allows it or an approval is present.
4. Persist evidence JSONL.
5. Replay the evidence in tests or incident review.
