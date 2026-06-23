# RuleOak Agentic Foundation: Ideas 1-5

RuleOak now exposes an `@ruleoak/core/agentic` entry point for developer-community primitives that make AI agents governable before they become enterprise vertical apps.

## 1. Flight Recorder

`FlightRecorder` is an append-only black-box recorder for agent actions. It records run lifecycle, action requests, policy decisions, approval requests, execution results, failures, and replay-ready metadata.

```js
import { FlightRecorder } from "@ruleoak/core/agentic";

const recorder = new FlightRecorder({ filePath: "out/evidence.jsonl" });
await recorder.wrapAction(
  { actionId: "a1", toolName: "search", operation: "read" },
  async () => ({ ok: true })
);
```

Secrets are redacted before persistence by default.

## 2. Agent Firewall

`AgentFirewall` evaluates an action envelope before execution. It returns:

- `allow`
- `deny`
- `needs_approval`
- `dry_run_only`

Dangerous or undeclared actions fail conservative by default.

```js
const firewall = new AgentFirewall({
  policy: {
    allowedActions: ["search.read"],
    approvalRequired: ["email.send"],
    blockedActions: ["filesystem.delete"]
  }
});
```

## 3. OpenClaw-style Safety Shield

`OpenClawSafetyShield` is an adapter pattern for OpenClaw-style personal agents. It normalizes personal-agent actions such as `email_send`, `file_delete`, `shell_run`, and `browser_purchase` into RuleOak action envelopes.

This is not an official OpenClaw integration. It is a safe local adapter pattern that can be turned into a real adapter later.

## 4. MCP Permission Gateway

`McpPermissionGateway` inventories MCP-style tools and gates `tools/call` requests through RuleOak policy before forwarding to a handler.

It supports:

- tool inventory
- risk classification
- allow/block/approval decisions
- JSON-RPC `tools/list`
- JSON-RPC `tools/call`
- evidence records for gateway decisions

## 5. Agent Action Replay

`AgentActionReplay` reads evidence events and reconstructs a chronological action timeline for debugging and incident review.

```js
const replay = new AgentActionReplay({ filePath: "out/evidence.jsonl" });
console.log(replay.toText());
console.log(replay.toMarkdown());
```

## Boundary

These features are local-first developer primitives. They do not certify compliance, replace sandboxing, or guarantee prevention of all misuse. They make agent actions more inspectable, governable, and replayable.
