import { redactValue } from "../redaction.js";
export const CONTEXT_EVIDENCE_SCHEMA = "ruleoak.context_evidence.v1";
export function contextDecisionToEvidence(decision = {}) {
  return redactValue({ schemaVersion: CONTEXT_EVIDENCE_SCHEMA, eventType: "context_decision", ...decision });
}
