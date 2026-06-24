# RuleOak Agentic Diagrams

Each diagram is intended to be shown one by one at equal width in README, docs, and website pages.

## Agentic stack

![Agentic stack](../assets/agentic-diagrams/agentic-stack.svg)

## Flight recorder lifecycle

![Flight recorder lifecycle](../assets/agentic-diagrams/flight-recorder-lifecycle.svg)

## MCP permission gateway

![MCP permission gateway](../assets/agentic-diagrams/mcp-permission-gateway.svg)

## Approval and dry-run flow

![Approval and dry-run flow](../assets/agentic-diagrams/approval-dry-run-flow.svg)

## Manifest and Safety CI flow

![Manifest and Safety CI flow](../assets/agentic-diagrams/manifest-safety-ci-flow.svg)

## Agentic skill integration

![Agentic skill integration](../assets/agentic-diagrams/agentic-skill-integration.svg)

## License boundary

![License boundary](../assets/agentic-diagrams/license-boundary.svg)

## Developer adoption loop

![Developer adoption loop](../assets/agentic-diagrams/developer-adoption-loop.svg)

## Policy precedence

RuleOak Core follows the RuleOak policy model:

1. `blockedActions` always wins.
2. `allowedActions` and `approvalRequired` are compared by pattern specificity.
3. If allow and approval match with the same specificity, `needs_approval` wins.
4. `defaultAction` applies only when no explicit policy pattern matches.

Exact action keys such as `filesystem.read` are more specific than namespace wildcards such as `filesystem.*`, and `*` is the least-specific catch-all.
