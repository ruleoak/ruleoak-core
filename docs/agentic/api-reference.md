# RuleOak Agentic API Reference

Stable public entry point:

```js
import { AgentFirewall, FlightRecorder } from "@ruleoak/core/agentic";
```

## Stable APIs

- `FlightRecorder`
- `AgentFirewall`
- `OpenClawSafetyShield`
- `McpPermissionGateway`
- `AgentActionReplay`
- `ApprovalLinkProtocol`
- `AgentDryRunMode`
- `LocalEvidenceVault`
- `ToolRiskScanner`
- `validateEvidenceEvent`
- `validateEvidenceJsonlText`
- `validateRuleOakManifest`
- `runAgentSafetyCi`
- `calculateAgentTrustScore`
- `AI_AGENT_CONSTITUTION_PACKS`

## Error classes

- `RuleOakAgenticError`
- `RuleOakPolicyError`
- `RuleOakEvidenceValidationError`
- `RuleOakApprovalRequiredError`
- `RuleOakPermissionDeniedError`
- `RuleOakReplayError`

These errors are stable for v2.2.x developer integrations.
