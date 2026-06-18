<p align="center">
  <img src="docs/assets/brand/ruleoak-logo-transparent.png" alt="RuleOak" width="360">
</p>

# RuleOak Core

> **Policy, approval, evidence, and audit for AI tool calls**
>
> RuleOak wraps agent actions before they execute, so your application can decide whether to **allow**, **deny**, or **require human approval** — with evidence and audit records captured automatically.

```text
AI proposes a tool call
→ RuleOak checks policy
→ RuleOak records evidence
→ RuleOak gates risky actions
→ RuleOak writes an audit trail
→ RuleOak generates a report
```

RuleOak Core v2.0.3 is an AGPL, local-first governance layer for developers building AI agents, local LLM workflows, MCP-style tools, and vertical AI applications where unchecked tool use is not acceptable.

[Website](https://ruleoak.com) · [10-minute guide](docs/integrations/govern-ai-tool-call-in-10-minutes.md) · [Governance protocol](docs/protocol/governance-records-v1.md) · [Security boundary](SECURITY.md)

---

## Start here

```bash
npm install
npm run integrate:10min
npm run report:html
```

The 10-minute demo shows the core RuleOak pattern:

| Proposed tool call | Decision | Why |
|---|---|---|
| `search_docs` | allowed | read-only local evidence action |
| `send_external_message` | approval required | external communication needs review |
| `delete_workspace_file` | denied | destructive local action is blocked |

Then open the generated reports under:

```text
reports/html/
```

For the guided first-run path:

```bash
npm run launch
```

---

## Why developers use RuleOak

AI agents are becoming useful because they can call tools. That is also where risk starts.

RuleOak helps developers add governance without redesigning the whole application:

| Developer need | RuleOak provides |
|---|---|
| Add governance around existing tool calls | Tool Guard and adapter patterns |
| Keep policy outside prompts | policy packs and explicit decision records |
| Stop dangerous actions by default | deny / approval-required / allow decisions |
| Keep humans accountable | local approval inbox |
| Explain why an action was allowed or blocked | evidence and policy decision records |
| Review what happened later | audit logs, HTML reports, report catalog |
| Stay local-first | local files, local reports, no required cloud service |
| Prepare for serious workflows | protocol, conformance tests, security boundary docs |

RuleOak is not trying to replace agent frameworks. It is the governance layer around agent actions.

---

## What RuleOak includes

| Area | Included |
|---|---|
| Governance runtime | runs, evidence, approvals, audit events, policy decisions, reports |
| Tool Guard | evaluate proposed tool calls before execution |
| MCP Guard | MCP-style tool-call evaluation and local proxy prototype |
| Protocol | `ruleoak.governance.v1` records, schemas, golden samples, conformance tests |
| Adapters | dependency-free LangGraph-style and CrewAI-style adapter samples |
| Policy packs | filesystem safety, external communication, ticketing, cloud LLM approval, PII redaction |
| Connectors | read-only evidence connector patterns and approval-gated write intents |
| Approval UX | local, file-backed approval inbox |
| Reports | HTML reports, report catalog, local telemetry-style export |
| Sandbox foundation | filesystem, network, command, and tool policy guards |
| SDK path | private-preview Python bridge guidance for RuleOak-compatible records |

---

## 60-second flow

![RuleOak tool-call approval audit demo](docs/assets/demo/ruleoak-tool-call-approval-audit-demo.gif)

The flow is intentionally simple:

```text
tool call → policy → evidence → approval → audit → report
```

---

## Common commands

```bash
# First-run path
npm run launch

# Govern one tool call flow
npm run integrate:10min
npm run guard:demo

# MCP-style tool governance
npm run mcp:demo
npm run mcp:proxy:demo

# Policy packs and approvals
npm run policy:packs:list
npm run policy:demo
npm run approval:inbox:build

# Evidence, reports, and telemetry
npm run connector:demo
npm run report:html
npm run viewer:build
npm run telemetry:export

# Protocol and quality
npm run protocol:conformance
npm test
```

---

## Where RuleOak fits

RuleOak complements orchestration, agent, and observability tools.

| Tool category | Typical focus | RuleOak focus |
|---|---|---|
| Agent orchestrators | graph flow, state, memory, routing | govern actions before execution |
| Multi-agent frameworks | roles, crews, collaboration | policy and audit around tool calls |
| MCP tools | expose tools to AI clients | guard MCP-style tool calls |
| Observability tools | traces, metrics, logs | policy, evidence, approval, and audit records |
| Application code | business workflow | reusable governance boundary |

RuleOak is most useful when an AI workflow needs to answer:

```text
Was this action allowed?
What evidence supported it?
Did a human need to approve it?
What exactly happened?
Can we review the decision later?
```

---

## Why RuleOak is harder to replace than a policy JSON file

A basic `policy.json` and `audit.jsonl` are easy to build. RuleOak’s moat is the combination:

1. **Governance record protocol** — stable `ruleoak.governance.v1` record shapes
2. **Conformance kit** — schemas, golden samples, validation commands
3. **Tool-call guard** — allow / deny / approval-required before execution
4. **MCP direction** — MCP Guard and proxy prototype for tool ecosystems
5. **Adapter path** — LangGraph-style, CrewAI-style, and Python bridge patterns
6. **Policy packs** — reusable governance defaults for common risks
7. **Approval UX** — local approval inbox for reviewable human decisions
8. **Audit reports** — evidence-backed reports for review and sharing
9. **Security boundaries** — sandbox foundation, local-first design, explicit limits
10. **Versioned compatibility** — protocol stability path for SDKs and vertical apps

That combination is the product: a governance layer for AI agent actions, not a single helper function.

---

## Governance Protocol v1

RuleOak Core v2.0.3 uses:

```text
ruleoak.governance.v1
```

Core record types:

- `RunRecord`
- `EvidenceRecord`
- `ApprovalRecord`
- `AuditEvent`
- `PolicyDecisionRecord`
- `ReportRecord`

Validate protocol conformance:

```bash
npm run protocol:conformance
```

Read:

- [Governance records v1](docs/protocol/governance-records-v1.md)
- [Compatibility statement](docs/protocol/compatibility-statement.md)

---

## Local Approval Inbox

Build a local approval inbox:

```bash
npm run approval:inbox:build
```

Generated files:

```text
reports/approval-inbox/index.html
reports/approval-inbox/approvals.json
```

Approve or reject local approval records:

```bash
npm run approval:approve -- <approval-id>
npm run approval:reject -- <approval-id>
```

The approval inbox is local-only and file-backed. It is not a hosted approval service.

---

## Local-first reports and telemetry

Generate HTML reports:

```bash
npm run report:html
```

Build the report catalog:

```bash
npm run viewer:build
```

Export local telemetry-style files:

```bash
npm run telemetry:export
```

RuleOak does not send telemetry to any external service.

---

## Python bridge direction

RuleOak Core remains the canonical runtime foundation.

The private-preview `ruleoak-py` SDK is used to validate Python vertical-app integration with `ruleoak.governance.v1` records and governed LLM calls.

The Python SDK is a bridge, not a fork of RuleOak Core. It is not yet a public stable package.

Read [Python SDK compatibility](docs/integrations/python-sdk-compatibility.md).

---

## Safety boundaries

RuleOak Core v2.0.3 is a local-first developer release. It is designed to be conservative, but it does not claim to be:

- a certified compliance product
- an externally security-reviewed sandbox
- a hosted enterprise control plane
- a production write-connector platform
- a substitute for application security review

Current external-style connectors are fixture-based, local, read-only, or dry-run approval-intent examples unless explicitly stated otherwise.

Read:

- [Security policy](SECURITY.md)
- [Threat model](docs/security/threat-model.md)
- [Sandbox boundaries](docs/security/sandbox-boundaries.md)

---

## Feedback-first contribution model

RuleOak Core is currently in a feedback-first contribution phase.

Issues and Discussions are welcome. Pull requests are disabled while contribution governance and licensing terms are finalized.

Useful feedback includes:

- setup problems
- confusing README steps
- unclear examples
- policy model questions
- MCP integration questions
- security boundary concerns
- real workflow suggestions

Read [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

RuleOak Core is released under **AGPL-3.0-or-later**.

Commercial licensing and closed-source embedding paths may require a separate license. Review licensing carefully before using RuleOak Core inside proprietary products or hosted services.

Read [docs/license-faq.md](docs/license-faq.md).

---

## The shortest test

```bash
npm install
npm run inspect
npm test
npm run integrate:10min
npm run report:html
```

Expected result:

```text
All tests pass
The 10-minute demo runs
HTML reports are generated locally
No external credentials are required
No external write actions occur
```
