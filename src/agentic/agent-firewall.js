import { randomUUID } from "node:crypto";
import { PolicyEngine } from "../runtime/policy-engine.js";
import { ToolRiskClassifier } from "../guard/risk-classifier.js";
import { FlightRecorder } from "./flight-recorder.js";
import { redactValue } from "./redaction.js";

const HIGH_RISK_OPERATIONS = new Set(["delete", "remove", "destroy", "drop", "wipe", "send", "deploy", "execute", "run_shell", "spend", "pay", "modify_production"]);

function normalizeAction(action = {}) {
  const actionId = action.actionId || action.id || `action-${randomUUID()}`;
  const toolName = action.toolName || action.tool || action.name || action.action || "unknown_tool";
  const operation = action.operation || action.intent || action.verb || toolName;
  return {
    ...action,
    actionId,
    toolName,
    operation,
    target: action.target || action.subject || null,
    input: action.input || action.arguments || action.payload || {},
    metadata: action.metadata || {}
  };
}

function policyList(policy, camelName, snakeName) {
  return [
    ...(Array.isArray(policy?.[camelName]) ? policy[camelName] : []),
    ...(Array.isArray(policy?.[snakeName]) ? policy[snakeName] : [])
  ]; 
}

function patternSpecificity(pattern = "") {
  const p = String(pattern || "").trim();
  if (!p) return -1;
  if (p === "*") return 0;
  if (!p.includes("*")) return 1000 + p.split(".").filter(Boolean).length * 10 + p.length;
  if (p.endsWith(".*")) return 500 + p.slice(0, -2).split(".").filter(Boolean).length * 10 + p.length;
  return 100 + p.replace(/\*/g, "").length;
}

function patternMatchesAction(pattern = "", actionKey = "") {
  const p = String(pattern || "").trim();
  const key = String(actionKey || "").trim();
  if (!p || !key) return false;
  if (p === "*" || p === key) return true;
  if (p.endsWith(".*")) return key === p.slice(0, -2) || key.startsWith(p.slice(0, -1));
  if (p.includes("*")) {
    const escaped = p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`).test(key);
  }
  return false;
}

function matchingPatterns(patterns = [], keys = []) {
  const matches = [];
  for (const pattern of patterns || []) {
    for (const key of keys) {
      if (patternMatchesAction(pattern, key)) matches.push({ pattern, key, specificity: patternSpecificity(pattern) });
    }
  }
  return matches.sort((a, b) => b.specificity - a.specificity || String(a.pattern).localeCompare(String(b.pattern)));
}

function decisionFromEffect(effect, action, risk, reason) {
  if (effect === "deny" || effect === "blocked") {
    return { decision: "deny", policyDecision: "blocked", allowedNow: false, approvalRequired: false, blocked: true, reason: reason || `risk ${risk} denied` };
  }
  if (effect === "approval_required" || effect === "needs_approval") {
    return { decision: "needs_approval", policyDecision: "approval_required", allowedNow: false, approvalRequired: true, blocked: false, reason: reason || `risk ${risk} requires approval` };
  }
  if (effect === "dry_run_only") {
    return { decision: "dry_run_only", policyDecision: "dry_run_only", allowedNow: false, approvalRequired: false, blocked: false, dryRunOnly: true, reason: reason || `risk ${risk} is dry-run only` };
  }
  return { decision: "allow", policyDecision: "allowed", allowedNow: true, approvalRequired: false, blocked: false, reason: reason || `risk ${risk} allowed` };
}

export class AgentFirewall {
  constructor({ policy = {}, recorder = null, riskClassifier = new ToolRiskClassifier(), runId, actor = "agent", clock } = {}) {
    this.policy = policy || {};
    this.policyEngine = new PolicyEngine(policy);
    this.riskClassifier = riskClassifier;
    this.recorder = recorder || new FlightRecorder({ runId, actor, clock });
    this.actor = actor;
    this.decisions = [];
    this.runId = this.recorder.runId;
  }

  classifyRisk(action = {}) {
    const normalized = normalizeAction(action);
    if (["low", "medium", "high", "unknown"].includes(normalized.risk)) return normalized.risk;
    if (HIGH_RISK_OPERATIONS.has(String(normalized.operation).toLowerCase())) return "high";
    return this.riskClassifier.classify(
      {
        id: normalized.toolName,
        name: normalized.toolName,
        description: normalized.description || "",
        kind: normalized.kind || normalized.operation,
        risk: normalized.toolRisk || "auto"
      },
      {
        toolId: normalized.toolName,
        action: normalized.operation,
        subject: normalized.target || normalized.description || "",
        metadata: normalized.metadata
      }
    );
  }

  evaluateAction(action = {}) {
    const normalized = normalizeAction(action);
    const risk = this.classifyRisk(normalized);
    const actionKey = normalized.action || normalized.toolName;
    const operationKey = `${normalized.toolName}.${normalized.operation}`;
    const blockedPatterns = policyList(this.policy, "blockedActions", "blocked_actions");
    const approvalPatterns = policyList(this.policy, "approvalRequired", "approval_required");
    const allowedPatterns = policyList(this.policy, "allowedActions", "allowed_actions");
    const dryRunPatterns = policyList(this.policy, "dryRunOnly", "dry_run_only");
    const keys = [operationKey, actionKey, normalized.toolName].filter(Boolean);

    let decision;
    const blocked = matchingPatterns(blockedPatterns, keys)[0];
    if (blocked) {
      decision = decisionFromEffect("deny", normalized, risk, `blocked by firewall policy: ${blocked.pattern}`);
    } else {
      const dryRun = matchingPatterns(dryRunPatterns, keys)[0];
      const allowed = matchingPatterns(allowedPatterns, keys)[0];
      const approval = matchingPatterns(approvalPatterns, keys)[0];
      if (dryRun) {
        decision = decisionFromEffect("dry_run_only", normalized, risk, `restricted to dry-run by firewall policy: ${dryRun.pattern}`);
      } else if (allowed && approval) {
        if (allowed.specificity > approval.specificity) decision = decisionFromEffect("allow", normalized, risk, `most-specific allow policy matched: ${allowed.pattern}`);
        else if (approval.specificity > allowed.specificity) decision = decisionFromEffect("approval_required", normalized, risk, `most-specific approval policy matched: ${approval.pattern}`);
        else decision = decisionFromEffect("approval_required", normalized, risk, `same-specificity allow/approval conflict; approval required: ${approval.pattern}`);
      } else if (allowed) {
        decision = decisionFromEffect("allow", normalized, risk, `allowed by firewall policy: ${allowed.pattern}`);
      } else if (approval) {
        decision = decisionFromEffect("approval_required", normalized, risk, `requires approval by firewall policy: ${approval.pattern}`);
      } else if (this.policy.defaultAction) {
        const normalizedDefault = this.policy.defaultAction === "approval" || this.policy.defaultAction === "ask" ? "needs_approval" : this.policy.defaultAction;
        decision = normalizedDefault === "allow" ? decisionFromEffect("allow", normalized, risk, "allowed by defaultAction")
          : normalizedDefault === "deny" ? decisionFromEffect("deny", normalized, risk, "denied by defaultAction")
          : normalizedDefault === "dry_run_only" ? decisionFromEffect("dry_run_only", normalized, risk, "dry-run by defaultAction")
          : decisionFromEffect("approval_required", normalized, risk, "requires approval by defaultAction");
      } else {
        const explicit = this.policyEngine.evaluate(normalized.toolName, { action: normalized, risk });
        decision = explicit.decision === "blocked"
          ? decisionFromEffect("deny", normalized, risk, explicit.reason)
          : explicit.decision === "approval_required"
            ? decisionFromEffect("approval_required", normalized, risk, explicit.reason)
            : explicit.decision === "allowed"
              ? decisionFromEffect("allow", normalized, risk, explicit.reason)
              : decisionFromEffect(this.riskClassifier.defaultEffectForRisk(risk), normalized, risk, `not declared in policy; default risk ${risk}`);
      }
    }

    const record = {
      schemaVersion: "ruleoak.agent_firewall.decision.v1",
      runId: this.runId,
      actionId: normalized.actionId,
      actor: normalized.actor || this.actor,
      toolName: normalized.toolName,
      operation: normalized.operation,
      target: normalized.target,
      risk,
      ...decision,
      action: redactValue(normalized)
    };
    this.recorder.record("policy_decision", record);
    if (record.approvalRequired) {
      this.recorder.record("approval_requested", {
        actionId: record.actionId,
        toolName: record.toolName,
        operation: record.operation,
        risk,
        reason: record.reason,
        status: "pending"
      });
    }
    this.decisions.push(record);
    return record;
  }

  async guardAction(action = {}, executor) {
    const normalized = normalizeAction(action);
    this.recorder.record("action_requested", normalized);
    const decision = this.evaluateAction(normalized);
    if (decision.blocked) return { decision, executed: false, result: null };
    if (decision.approvalRequired && !normalized.approved) return { decision, executed: false, result: null };
    if (decision.decision === "dry_run_only") return { decision, executed: false, result: { dryRunOnly: true } };
    if (typeof executor !== "function") return { decision, executed: false, result: null };
    try {
      const result = await executor(normalized, decision);
      this.recorder.record("action_executed", { actionId: normalized.actionId, result });
      return { decision, executed: true, result };
    } catch (error) {
      this.recorder.record("action_failed", { actionId: normalized.actionId, error: { name: error.name, message: error.message } });
      throw error;
    }
  }

  report({ title = "RuleOak Agent Firewall Report", summary = "Agent actions governed before execution." } = {}) {
    return {
      runtimeStage: "agent-firewall",
      title,
      summary,
      runId: this.runId,
      counts: {
        decisions: this.decisions.length,
        allowed: this.decisions.filter((d) => d.decision === "allow").length,
        approvalRequired: this.decisions.filter((d) => d.decision === "needs_approval").length,
        blocked: this.decisions.filter((d) => d.decision === "deny").length,
        dryRunOnly: this.decisions.filter((d) => d.decision === "dry_run_only").length
      },
      decisions: [...this.decisions],
      evidence: this.recorder.list(),
      boundaryNote: "Agent Firewall evaluates tool/action intent before execution. It does not replace sandboxing, identity controls, or formal compliance certification."
    };
  }
}
