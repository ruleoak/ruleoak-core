# 10-minute developer quickstart

RuleOak Core is a TypeScript runtime library for governing AI tool calls before execution. It provides guard and policy checks, approval gates, evidence records, audit reports, and protocol conformance tools.

Goal: run the same governance loop shown in the website and demo GIF without reading the whole repository.

```text
Declare tool call → Evaluate policy → Decide allow / approve / block → Pause for approval when required → Record evidence and audit events → Validate and export audit report
```

## 1. Install

```bash
npm install
```

## 2. Run the full quickstart

```bash
npm run quickstart:all
```

This runs five small examples:

| Step | Command | Expected result |
|---|---|---|
| 1 | `npm run quickstart:01` | `search_docs` is allowed and evidence is recorded |
| 2 | `npm run quickstart:02` | dangerous deletion is blocked before execution |
| 3 | `npm run quickstart:03` | external send requires approval |
| 4 | `npm run quickstart:04` | JSON and HTML audit reports are generated |
| 5 | `npm run quickstart:05` | evidence bundle and audit chain can be replayed |

## 3. Validate protocol conformance

```bash
npm run protocol:conformance
```

## 4. Build the local approval/audit surface

```bash
npm run product:surface:demo
```

## Outputs to inspect

```text
quickstart/out/
reports/html/
reports/approval-audit-surface/
```

## What this proves

- policy is outside prompts
- risky actions can pause for approval before execution
- blocked actions do not run
- evidence and audit events are recorded
- reports are generated locally
- protocol compatibility can be validated locally

RuleOak is an application-level tool-call governance boundary. It does not replace runtime sandboxing or claim certified compliance.
