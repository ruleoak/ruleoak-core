# High-risk agent action demos

This public RuleOak Core demo shows seven synthetic, local, deterministic, non-destructive scenarios:

1. AI tries to delete a protected folder.
2. AI tries to run a shell command.
3. AI tries to mutate a database.
4. AI tries to call a dangerous MCP tool.
5. AI tries to send an external email-like action.
6. AI uses poisoned retrieved context.
7. AI installs a risky skill/plugin.

Run:

```bash
npm run agentic:high-risk-demos
```

Outputs:

```text
examples/high-risk-agent-actions/out/summary.json
examples/high-risk-agent-actions/out/report.md
```

This is a public developer demo for RuleOak Core v2.2.0. It does not include private SafeDesk product code or premium vertical templates.
