export const RULEOAK_EVIDENCE_SCHEMA_VERSION = "ruleoak.agentic.evidence.v1";
export const RULEOAK_MANIFEST_SCHEMA_VERSION = "ruleoak.manifest.v1";
export const RULEOAK_POLICY_SCHEMA_VERSION = "ruleoak.policy.v1";
export const RULEOAK_SKILL_SCHEMA_VERSION = "ruleoak.skill.v1";

export const RULEOAK_DECISIONS = ["allow", "deny", "needs_approval", "dry_run_only"];
export const RULEOAK_BADGES = {
  evidenceCompatible: "RuleOak Evidence-compatible",
  replayCompatible: "RuleOak Replay-compatible",
  approvalGated: "RuleOak Approval-gated",
  safetyCiChecked: "RuleOak Safety-CI checked"
};

export function isRuleOakEvidenceEvent(event = {}) {
  return (event.schemaVersion === RULEOAK_EVIDENCE_SCHEMA_VERSION || event.schema_version === RULEOAK_EVIDENCE_SCHEMA_VERSION) && Boolean(event.eventId || event.event_id) && Boolean(event.runId || event.run_id) && Boolean(event.type || event.eventType || event.event_type);
}

export function normalizeAdapterEnvelope(action = {}) {
  return {
    schemaVersion: "ruleoak.action_envelope.v1",
    toolName: action.toolName || action.tool || "unknown",
    operation: action.operation || action.action || "unknown",
    target: action.target || null,
    input: action.input || action.payload || {},
    metadata: action.metadata || {},
    risk: action.risk || "unknown"
  };
}

export function validateRuleOakPolicy(policy = {}) {
  const errors = [];
  if (policy.schemaVersion !== RULEOAK_POLICY_SCHEMA_VERSION) errors.push(`schemaVersion must be ${RULEOAK_POLICY_SCHEMA_VERSION}`);
  if (!["allow", "approval", "deny"].includes(policy.defaultAction)) errors.push("defaultAction must be allow, approval, or deny");
  return { ok: errors.length === 0, errors };
}

export function validateRuleOakManifest(manifest = {}) {
  const schema = manifest.schemaVersion || manifest.schema_version;
  const errors = [];
  if (schema !== RULEOAK_MANIFEST_SCHEMA_VERSION) errors.push(`schemaVersion must be ${RULEOAK_MANIFEST_SCHEMA_VERSION}`);
  if (!manifest.project) errors.push("project is required");
  return { ok: errors.length === 0, errors };
}
