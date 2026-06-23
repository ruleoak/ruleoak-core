# Public repositories

## Public repositories

The public RuleOak ecosystem is split so developers can adopt the protocol and adapters without taking a dependency on the full AGPL runtime unless they need enforcement.

| Repository | Version | License | Use when you need |
|---|---:|---|---|
| [`ruleoak-core`](https://github.com/ruleoak/ruleoak-core) | `2.2.0` | AGPL-3.0-or-later + commercial option | Agent Firewall, Flight Recorder, approval gates, dry-run, replay, runtime enforcement. |
| [`ruleoak-protocol`](https://github.com/ruleoak/ruleoak-protocol) | `1.0.0` | MIT | Evidence JSONL, `.ruleoak.yml`, action envelopes, schemas, badges, and conformance fixtures. |
| [`ruleoak-adapters-ts`](https://github.com/ruleoak/ruleoak-adapters-ts) | `1.0.0` | Apache-2.0 | TypeScript adapters for MCP-style, tool-calling, OpenAI Agents JS-style, LangChain.js-style, Vercel AI SDK-style, coding-agent, and OpenClaw-style workflows. |
| [`ruleoak-py`](https://github.com/ruleoak/ruleoak-py) | `1.0.0` | Apache-2.0 | Python bridge/adapters for LangGraph and Python agentic workflows. |
| [`ruleoak-openclaw-adapter`](https://github.com/ruleoak/ruleoak-openclaw-adapter) | `1.0.0` | MIT | Optional OpenClaw-style compatibility adapter. Not official or endorsed by OpenClaw maintainers. |
| [`ruleoak-agentic-skills`](https://github.com/ruleoak/ruleoak-agentic-skills) | `1.0.0` | Apache-2.0 | Agentic skill manifests, safety scanner, permission summaries, and examples. |

SafeDesk and the consumer/prosumer vertical apps are private/commercial products powered by RuleOak Core. They are not published as public source code.
