export const RULEOAK_POLICY_VERSION = "ruleoak.policy.v1";
export const POLICY_ACTIONS = new Set(["allow", "approval", "deny"]);

export function validateRuleOakPolicy(policy = {}) {
  const errors = [];
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) errors.push("policy must be an object");
  if (policy.schemaVersion !== RULEOAK_POLICY_VERSION) errors.push(`schemaVersion must be ${RULEOAK_POLICY_VERSION}`);
  if (!POLICY_ACTIONS.has(policy.defaultAction)) errors.push("defaultAction must be one of allow, approval, deny");
  for (const [name, rules] of Object.entries(policy.tools || {})) {
    if (!POLICY_ACTIONS.has(rules)) errors.push(`tools.${name} must be allow, approval, or deny`);
  }
  return { ok: errors.length === 0, errors };
}

export function decisionForPolicyAction(action) {
  if (action === "allow") return "allow";
  if (action === "deny") return "deny";
  return "needs_approval";
}

export function evaluateRuleOakPolicy(policy = {}, action = {}) {
  const validation = validateRuleOakPolicy(policy);
  if (!validation.ok) return { decision: "deny", reason: validation.errors.join("; ") };
  const key = action.category || `${action.toolName || action.tool || "unknown"}.${action.operation || action.action || "unknown"}`;
  const policyAction = policy.tools?.[key] || policy.defaultAction;
  return { decision: decisionForPolicyAction(policyAction), reason: `policy ${key} => ${policyAction}`, policyAction, key };
}
