# RuleOak Agentic Foundation

RuleOak v2.2.0 Developer Preview positions the project as an **Agent Firewall + Flight Recorder for AI agents**.

The goal is simple:

> Before an AI agent sends, deletes, spends, deploys, or changes production, RuleOak can block, approve, record, and replay the action.

## Start here

```bash
npm run agentic:quickstart
npm run agentic:public-demo
npm run agentic:conformance
npm run test:agentic
```

## Core primitives

| Primitive | Why developers care |
|---|---|
| Agent Firewall | Stop or pause risky actions before tool execution. |
| Flight Recorder | Save evidence-grade JSONL for every important action event. |
| MCP Permission Gateway | Put policy in front of MCP-style tools. |
| Action Replay | Reconstruct what the agent did from evidence records. |
| `.ruleoak.yml` | Make permissions inspectable in a repo. |
| Safety CI | Fail unsafe integrations before merge. |
| Badge / Trust Score | Show compatibility honestly without claiming certification. |
| Local Evidence Vault | Search past agent actions locally. |

## Diagrams

See [Agentic diagrams](diagrams.md).

## Integration recipes

- [Integrate with any agent](integrations/any-agent.md)
- [Integrate with MCP-style tools](integrations/mcp.md)
- [Integrate with OpenClaw-style agents](integrations/openclaw-style-agent.md)
- [Integrate with Claude Code-style coding agents](integrations/claude-code-style-agent.md)
- [Integrate with local LLM agents](integrations/local-llm-agent.md)

## Ecosystem compatibility

See [Agentic evidence conformance](evidence-conformance.md).
