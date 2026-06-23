# Evidence JSONL v1

Schema version: `ruleoak.agentic.evidence.v1`.

Evidence JSONL is the portable action timeline format for RuleOak-compatible agents.

Required fields:

- `schemaVersion`
- `eventId`
- `runId`
- `sessionId`
- `sequence`
- `type`
- `timestamp`
- `actor`
- `payload`

Validate:

```bash
npm run agentic:conformance
```

Fixture:

```text
fixtures/agentic/evidence/v1/valid-agentic-evidence.jsonl
```
