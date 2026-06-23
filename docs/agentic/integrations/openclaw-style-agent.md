# Integrate RuleOak with OpenClaw-style agents

This is an adapter pattern for personal agents that can perform actions such as email, filesystem, shell, calendar, browser, and payment-like operations.

RuleOak does not claim official OpenClaw integration here. The pattern is:

1. Normalize the external agent action.
2. Classify risk.
3. Apply RuleOak policy.
4. Pause, deny, dry-run, or execute.
5. Record replayable evidence.

```js
import { OpenClawSafetyShield } from "@ruleoak/core/agentic";

const shield = new OpenClawSafetyShield({
  policy: {
    allowedActions: ["read_context"],
    approvalRequired: ["email_send"],
    blockedActions: ["file_delete", "shell_run"]
  }
});

await shield.guardOpenClawAction({
  kind: "email_send",
  to: "external@example.com",
  subject: "Draft",
  body: "Please review."
});
```
