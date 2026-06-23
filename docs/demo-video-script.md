# Demo video script

This script matches the current demo asset:

```text
docs/assets/demo/ruleoak-v2.2.0-demo.gif
```

## Message

RuleOak Core is a TypeScript runtime library for governing AI tool calls before execution. It provides guard and policy checks, approval gates, evidence records, audit reports, and protocol conformance tools.

## Sequence

```text
Declare tool call → Evaluate policy → Decide allow / approve / block → Pause for approval when required → Record evidence and audit events → Validate and export audit report
```

## Script

1. Start with a proposed AI tool call.
2. Show policy evaluation before execution.
3. Show the decision: allow, approval required, or blocked.
4. Show approval when the action is risky.
5. Show evidence and audit events being recorded.
6. Show local validation and audit report export.

Use narrow claims. Do not describe RuleOak as certified, audited, regulator-approved, or a complete sandbox.
