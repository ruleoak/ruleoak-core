import assert from "node:assert/strict";
import * as agentic from "../src/agentic/index.js";

for (const name of [
  "FlightRecorder", "AgentFirewall", "McpPermissionGateway", "AgentActionReplay", "ApprovalLinkProtocol", "AgentDryRunMode", "LocalEvidenceVault", "ToolRiskScanner", "validateEvidenceJsonlText", "validateRuleOakManifest", "runAgentSafetyCi", "calculateAgentTrustScore", "RuleOakPolicyError", "RuleOakEvidenceValidationError", "RuleOakApprovalRequiredError", "RuleOakPermissionDeniedError", "RuleOakReplayError"
]) {
  assert.equal(Boolean(agentic[name]), true, `missing stable export ${name}`);
}
const err = new agentic.RuleOakPolicyError("policy failed", { code: "POLICY_FAILED", details: { action: "delete" } });
assert.equal(err.name, "RuleOakPolicyError");
assert.equal(err.code, "POLICY_FAILED");
console.log("agentic-stable-api.test.js passed");
