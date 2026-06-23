# RuleOak agentic evidence conformance

A project can be described as **RuleOak-compatible** when it emits valid RuleOak Agentic Evidence JSONL and passes the local conformance check.

Run:

```bash
npm run agentic:conformance
npm run agentic:conformance:json
```

Compatible wording:

> Emits RuleOak-compatible agentic evidence using `ruleoak.agentic.evidence.v1`.

Avoid:

- RuleOak certified
- security certified
- compliance approved
- regulator approved

## Required event fields

- `schemaVersion`
- `eventId`
- `runId`
- `sessionId`
- `sequence`
- `type`
- `timestamp`
- `actor`
- `payload`

Schemas live under `schemas/agentic/` and are permissively licensed to encourage adoption.
