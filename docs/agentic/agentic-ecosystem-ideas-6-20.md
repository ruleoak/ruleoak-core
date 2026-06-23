# RuleOak Agentic Ecosystem: Ideas 6–20

This release extends the RuleOak Ideas 1–5 foundation into an ecosystem layer for developer adoption.

## Implemented modules

| Idea | Module | Purpose |
|---:|---|---|
| 6 | `ruleoak-yml-standard.js` | Parse, normalize, validate, and summarize `.ruleoak.yml` manifests. |
| 7 | `badge.js` | Generate and verify honest RuleOak README badge levels. |
| 8 | `safety-ci.js` | Offline CI safety check for manifest/tool governance coverage. |
| 9 | `prompt-to-policy-compiler.js` | Compile constrained plain-English rules into draft policy config. |
| 10 | `tool-risk-scanner.js` | Classify tools by read/write/delete/shell/email/secret/production risk. |
| 11 | `least-privilege-tool-filter.js` | Expose only tools needed for the current agent task. |
| 12 | `approval-link-protocol.js` | Create local approval requests and record approve/deny/edit evidence. |
| 13 | `evidence-jsonl-format.js` | Validate portable RuleOak evidence JSONL events. |
| 14 | `incident-report-generator.js` | Generate Markdown/HTML agent incident reports from evidence. |
| 15 | `dry-run-mode.js` | Preview risky actions without real side effects. |
| 16 | `examples/dangerous-action-demos` | Safe viral-style demos for dangerous actions. |
| 17 | `mcp-store-scanner.js` | Scan local MCP-style catalogs for risky tools and missing schemas. |
| 18 | `trust-score.js` | Non-certification Agent Trust Score based on RuleOak controls. |
| 19 | `local-evidence-vault.js` | Local-first searchable evidence index. |
| 20 | `constitution-packs.js` | Prebuilt policy packs for common agent categories. |

## Developer usage

```js
import {
  validateRuleOakManifest,
  scanToolRisks,
  filterToolsForLeastPrivilege,
  ApprovalLinkProtocol,
  AgentDryRunMode,
  LocalEvidenceVault,
  calculateAgentTrustScore
} from "@ruleoak/core/agentic";
```

## Safety boundary

These modules are local-first developer primitives. They are not legal advice, formal compliance certification, security certification, or a substitute for sandboxing, identity controls, production change controls, or human accountability.

Dangerous actions are conservative by default: deny, require approval, dry-run, redact, or withhold tools.

## Validation

Run:

```bash
npm run test:agentic
npm run agentic:dangerous-demo
```
