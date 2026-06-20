# Public demo sequence

Keep the launch demo short and concrete. The public demo, website, README, and quickstart should all use the same sequence.

RuleOak Core is a TypeScript runtime library for governing AI tool calls before execution. It provides guard and policy checks, approval gates, evidence records, audit reports, and protocol conformance tools.

```text
Declare tool call → Evaluate policy → Decide allow / approve / block → Pause for approval when required → Record evidence and audit events → Validate and export audit report
```

## Demo 1 — AI coding agent governance

```bash
npm run coding:agent-governance
```

Show:

1. the proposed coding-agent action is declared;
2. policy is evaluated before execution;
3. safe reads are allowed;
4. risky writes are governed;
5. destructive workspace deletion is blocked;
6. evidence-backed reports are generated.

Message:

> RuleOak governs the actions an AI coding agent wants to take before those actions execute.

## Demo 2 — Enterprise RAG answer governance

```bash
npm run rag:answer-governance
```

Show:

1. answer generation requires evidence;
2. sensitive source access is governed;
3. unsupported claims are flagged or blocked;
4. evidence-backed reports are generated.

Message:

> RuleOak separates evidence and policy from the prompt.

## Demo 3 — Local approval and audit report

```bash
npm run approval:ux:v2:check
npm run audit:viewer:v2:check
```

Show:

1. approval-required action has reviewer context;
2. approval packet can be exported;
3. audit viewer verifies evidence and audit-chain integrity.

Message:

> RuleOak turns tool-call decisions into reviewable evidence.

## Demo asset

Use only the current v2.1.0 demo asset:

```text
docs/assets/demo/ruleoak-v2.1.0-demo.gif
```

Older demo GIFs were removed to avoid public-release confusion.
