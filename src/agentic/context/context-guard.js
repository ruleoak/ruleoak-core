import { scanContextRisk } from "./context-risk-scanner.js";
import { contextDecisionToEvidence } from "./context-evidence.js";

export function evaluateContextItem(item = {}, policy = {}) {
  const scan = scanContextRisk(item);
  let decision = "allow";
  let reason = "context allowed";
  if (scan.risk === "high" && policy.highRiskAction !== "allow") { decision = policy.highRiskAction === "approval" ? "needs_approval" : "deny"; reason = "high-risk context detected"; }
  else if (scan.risk === "medium" && policy.mediumRiskAction === "quarantine") { decision = "quarantine"; reason = "medium-risk context quarantined"; }
  else if (scan.risk === "medium" && policy.mediumRiskAction === "summarize_only") { decision = "summarize_only"; reason = "medium-risk context requires summary-only use"; }
  return { decision, reason, scan, evidence: contextDecisionToEvidence({ item: { source: item.source || item.type || "unknown" }, decision, reason, scan }) };
}

export function guardContextItems(items = [], policy = {}) {
  const decisions = items.map((item) => evaluateContextItem(item, policy));
  return {
    allowed: items.filter((_, i) => decisions[i].decision === "allow"),
    quarantined: items.filter((_, i) => ["deny", "quarantine"].includes(decisions[i].decision)),
    summarizeOnly: items.filter((_, i) => decisions[i].decision === "summarize_only"),
    decisions,
    evidence: decisions.map((d) => d.evidence)
  };
}
