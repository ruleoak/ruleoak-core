# High-risk agent action demos

RuleOak Core v2.2.0 now includes a public demo set for common risky AI-agent actions.

Run:

```bash
npm run agentic:high-risk-demos
npm run test:high-risk-demos
```

The demo covers:

- AI tries to delete a protected folder.
- AI tries to run a shell command.
- AI tries to mutate a database.
- AI tries to call a dangerous MCP tool.
- AI tries to send an external email-like action.
- AI uses poisoned retrieved context.
- AI installs a risky skill/plugin.

The demo records replayable RuleOak evidence and produces a Markdown report under:

```text
examples/high-risk-agent-actions/out/report.md
```

These are public developer examples only. They do not contain private SafeDesk product code or paid vertical templates.
