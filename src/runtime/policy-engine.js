function listFromPolicy(policy, camelName, snakeName) {
  const camel = Array.isArray(policy?.[camelName]) ? policy[camelName] : [];
  const snake = Array.isArray(policy?.[snakeName]) ? policy[snakeName] : [];
  return [...camel, ...snake];
}

export class PolicyEngine {
  constructor(policy = {}) {
    this.policy = policy || {};
    this.allowed = new Set(listFromPolicy(policy, "allowedTools", "allowed_actions"));
    this.blocked = new Set(listFromPolicy(policy, "blockedTools", "blocked_actions"));
    this.approvalRequired = new Set(listFromPolicy(policy, "approvalRequired", "approval_required"));
  }

  evaluate(action, context = {}) {
    const actionId = typeof action === "string" ? action : action?.id || action?.action;
    if (!actionId) {
      return {
        action: "unknown",
        decision: "unknown_action_requires_review",
        allowedNow: false,
        approvalRequired: true,
        blocked: false,
        reason: "missing action id",
        context
      };
    }

    if (this.blocked.has(actionId)) {
      return {
        action: actionId,
        decision: "blocked",
        allowedNow: false,
        approvalRequired: false,
        blocked: true,
        reason: "blocked by policy",
        context
      };
    }

    if (this.approvalRequired.has(actionId)) {
      return {
        action: actionId,
        decision: "approval_required",
        allowedNow: false,
        approvalRequired: true,
        blocked: false,
        reason: "requires approval",
        context
      };
    }

    if (this.allowed.has(actionId)) {
      return {
        action: actionId,
        decision: "allowed",
        allowedNow: true,
        approvalRequired: false,
        blocked: false,
        reason: "allowed by policy",
        context
      };
    }

    return {
      action: actionId,
      decision: "unknown_action_requires_review",
      allowedNow: false,
      approvalRequired: true,
      blocked: false,
      reason: "not declared in policy",
      context
    };
  }

  boundary() {
    return this.policy.boundary || this.policy.boundary_level || "local_only";
  }
}
