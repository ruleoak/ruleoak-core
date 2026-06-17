export class ApprovalGate {
  constructor({ auditLog } = {}) {
    this.auditLog = auditLog;
    this.requests = [];
  }

  handleDecision(decision, proposedBy = "runtime") {
    if (!decision?.approvalRequired) {
      this.auditLog?.record("approval.not_required", { action: decision?.action, decision: decision?.decision });
      return { status: "not_required", request: null };
    }

    const request = {
      id: `${decision.action}-approval-${this.requests.length + 1}`,
      action: decision.action,
      status: "pending",
      proposedBy,
      reason: decision.reason,
      createdAt: new Date().toISOString()
    };
    this.requests.push(request);
    this.auditLog?.record("approval.requested", request);
    return { status: "pending", request };
  }

  list() {
    return [...this.requests];
  }
}
