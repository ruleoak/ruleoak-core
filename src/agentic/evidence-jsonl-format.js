import { existsSync, readFileSync } from "node:fs";

export const EVIDENCE_JSONL_SCHEMA_VERSION = "ruleoak.agentic.evidence.v1";

export const EVIDENCE_EVENT_TYPES = Object.freeze([
  "run_started",
  "action_requested",
  "policy_decision",
  "approval_requested",
  "approval_decision",
  "action_executed",
  "action_failed",
  "run_finished",
  "tool_inventory",
  "tool_filter_decision",
  "dry_run_preview",
  "incident_report_generated",
  "vault_indexed",
  "trust_score_generated"
]);

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeEvidenceEvent(event = {}, defaults = {}) {
  if (!isPlainObject(event)) throw new Error("evidence event must be an object");
  const type = event.type || defaults.type;
  if (!type) throw new Error("evidence event requires type");
  return {
    schemaVersion: event.schemaVersion || defaults.schemaVersion || EVIDENCE_JSONL_SCHEMA_VERSION,
    eventId: event.eventId || defaults.eventId || `evt-${Date.now()}`,
    runId: event.runId || defaults.runId || "run-unknown",
    sessionId: event.sessionId || defaults.sessionId || "session-unknown",
    sequence: Number.isFinite(Number(event.sequence)) ? Number(event.sequence) : Number(defaults.sequence || 0),
    type,
    timestamp: event.timestamp || defaults.timestamp || new Date().toISOString(),
    actor: event.actor || defaults.actor || "agent",
    payload: isPlainObject(event.payload) ? event.payload : {}
  };
}

export function validateEvidenceEvent(event = {}, { allowUnknownTypes = true } = {}) {
  const errors = [];
  if (!isPlainObject(event)) return { ok: false, errors: ["event must be an object"] };
  for (const field of ["schemaVersion", "eventId", "runId", "sessionId", "sequence", "type", "timestamp", "actor", "payload"]) {
    if (!(field in event)) errors.push(`missing required field: ${field}`);
  }
  if (event.schemaVersion && typeof event.schemaVersion !== "string") errors.push("schemaVersion must be a string");
  if (event.eventId && typeof event.eventId !== "string") errors.push("eventId must be a string");
  if (event.runId && typeof event.runId !== "string") errors.push("runId must be a string");
  if (event.sessionId && typeof event.sessionId !== "string") errors.push("sessionId must be a string");
  if (!(Number.isInteger(event.sequence) && event.sequence >= 0)) errors.push("sequence must be a non-negative integer");
  if (event.type && typeof event.type !== "string") errors.push("type must be a string");
  if (event.type && !allowUnknownTypes && !EVIDENCE_EVENT_TYPES.includes(event.type)) errors.push(`unknown event type: ${event.type}`);
  if (event.timestamp && Number.isNaN(Date.parse(event.timestamp))) errors.push("timestamp must be an ISO-like date string");
  if (event.actor && typeof event.actor !== "string") errors.push("actor must be a string");
  if (!isPlainObject(event.payload)) errors.push("payload must be an object");
  return { ok: errors.length === 0, errors };
}

export function validateEvidenceJsonlText(text = "", options = {}) {
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const events = [];
  const errors = [];
  lines.forEach((line, index) => {
    try {
      const event = JSON.parse(line);
      const validation = validateEvidenceEvent(event, options);
      if (!validation.ok) errors.push({ line: index + 1, errors: validation.errors });
      events.push(event);
    } catch (error) {
      errors.push({ line: index + 1, errors: [`invalid JSON: ${error.message}`] });
    }
  });
  return { ok: errors.length === 0, events, errors, lineCount: lines.length };
}

export function validateEvidenceJsonlFile(filePath, options = {}) {
  if (!existsSync(filePath)) return { ok: false, events: [], errors: [{ line: 0, errors: [`file not found: ${filePath}`] }], lineCount: 0 };
  return validateEvidenceJsonlText(readFileSync(filePath, "utf8"), options);
}

export function evidenceEventToJsonl(event = {}) {
  const normalized = normalizeEvidenceEvent(event);
  const validation = validateEvidenceEvent(normalized);
  if (!validation.ok) throw new Error(`invalid evidence event: ${validation.errors.join("; ")}`);
  return `${JSON.stringify(normalized)}\n`;
}
