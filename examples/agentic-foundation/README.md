# RuleOak Agentic Foundation Demo

This offline demo shows Ideas 1-5 implemented together:

1. **Flight Recorder** — append-only evidence JSONL for agent actions.
2. **Agent Firewall** — allow, deny, approval-required, and dry-run style decisions before execution.
3. **OpenClaw-style Safety Shield** — adapter pattern for personal agents with email/filesystem/shell/browser-style actions.
4. **MCP Permission Gateway** — local MCP-style tool inventory and permission gateway.
5. **Agent Action Replay** — readable replay timeline from evidence.

Run:

```bash
npm run agentic:demo
```

The demo uses only mock/local actions. It does not send email, delete files, call cloud APIs, or run real MCP servers.
