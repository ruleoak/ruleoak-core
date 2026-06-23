import { randomUUID } from "node:crypto";
import { redactValue } from "./redaction.js";

function nowIso() { return new Date().toISOString(); }
function plusMinutes(minutes) { return new Date(Date.now() + minutes * 60 * 1000).toISOString(); }

export class LocalApprovalStore {
  constructor() { this.requests = new Map(); }
  save(request) { this.requests.set(request.approvalId, request); return request; }
  get(approvalId) { return this.requests.get(approvalId) || null; }
  list() { return [...this.requests.values()]; }
}

export class ApprovalLinkProtocol {
  constructor({ baseUrl = "http://127.0.0.1:47821/approve", store = new LocalApprovalStore(), recorder = null, clock = nowIso } = {}) {
    this.baseUrl = baseUrl;
    this.store = store;
    this.recorder = recorder;
    this.clock = clock;
  }

  createRequest(action = {}, { risk = "unknown", reason = "approval required", expiryMinutes = 30 } = {}) {
    const approvalId = `approval-${randomUUID()}`;
    const request = {
      schemaVersion: "ruleoak.approval_request.v1",
      approvalId,
      actionId: action.actionId || action.id || `action-${randomUUID()}`,
      status: "pending",
      risk,
      reason,
      createdAt: this.clock(),
      expiresAt: plusMinutes(expiryMinutes),
      action: redactValue(action),
      approvalUrl: `${this.baseUrl}?id=${encodeURIComponent(approvalId)}`,
      decisions: []
    };
    this.store.save(request);
    if (this.recorder) this.recorder.record("approval_requested", request);
    return request;
  }

  decide(approvalId, { decision, actor = "human", editedAction = null, reason = "" } = {}) {
    const request = this.store.get(approvalId);
    if (!request) throw new Error(`approval request not found: ${approvalId}`);
    if (request.status !== "pending") throw new Error(`approval request is not pending: ${request.status}`);
    if (Date.parse(request.expiresAt) < Date.now()) {
      request.status = "expired";
      this.store.save(request);
      throw new Error("approval request expired");
    }
    if (!["approve", "deny", "edit"].includes(decision)) throw new Error("decision must be approve, deny, or edit");
    const record = { decision, actor, reason, decidedAt: this.clock(), editedAction: editedAction ? redactValue(editedAction) : null };
    request.status = decision === "approve" || decision === "edit" ? "approved" : "denied";
    request.decisions.push(record);
    if (editedAction) request.action = redactValue(editedAction);
    this.store.save(request);
    if (this.recorder) this.recorder.record("approval_decision", { approvalId, actionId: request.actionId, ...record, status: request.status });
    return request;
  }

  canProceed(approvalId) {
    const request = this.store.get(approvalId);
    return Boolean(request && request.status === "approved" && Date.parse(request.expiresAt) >= Date.now());
  }
}
