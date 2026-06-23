import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { redactValue } from "./redaction.js";

function nowIso() {
  return new Date().toISOString();
}

function normalizeEventType(type) {
  if (!type || typeof type !== "string") throw new Error("flight recorder event type is required");
  return type;
}

function ensureParentDirectory(filePath) {
  const parent = dirname(filePath);
  if (parent && parent !== "." && !existsSync(parent)) mkdirSync(parent, { recursive: true });
}

export class InMemoryEvidenceSink {
  constructor() {
    this.events = [];
  }

  append(event) {
    this.events.push(event);
  }

  list() {
    return [...this.events];
  }
}

export class JsonlEvidenceSink {
  constructor(filePath) {
    if (!filePath) throw new Error("JsonlEvidenceSink requires filePath");
    this.filePath = filePath;
    ensureParentDirectory(filePath);
  }

  append(event) {
    appendFileSync(this.filePath, `${JSON.stringify(event)}\n`, "utf8");
  }

  list() {
    return readEvidenceJsonl(this.filePath);
  }
}

export function readEvidenceJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  const text = readFileSync(filePath, "utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        const wrapped = new Error(`invalid evidence JSONL at line ${index + 1}: ${error.message}`);
        wrapped.line = index + 1;
        throw wrapped;
      }
    });
}

export class FlightRecorder {
  constructor({ runId = `roak-run-${randomUUID()}`, sessionId = `roak-session-${randomUUID()}`, actor = "agent", sink = null, filePath = null, redact = true, clock = nowIso } = {}) {
    this.runId = runId;
    this.sessionId = sessionId;
    this.actor = actor;
    this.redact = redact;
    this.clock = clock;
    this.sink = sink || (filePath ? new JsonlEvidenceSink(filePath) : new InMemoryEvidenceSink());
    this.sequence = 0;
  }

  record(type, payload = {}, options = {}) {
    const safePayload = this.redact && !options.unredacted ? redactValue(payload) : payload;
    const event = {
      schemaVersion: "ruleoak.agentic.evidence.v1",
      eventId: options.eventId || `evt-${String(++this.sequence).padStart(6, "0")}`,
      runId: options.runId || this.runId,
      sessionId: options.sessionId || this.sessionId,
      sequence: this.sequence,
      type: normalizeEventType(type),
      timestamp: options.timestamp || this.clock(),
      actor: options.actor || this.actor,
      payload: safePayload
    };
    this.sink.append(event);
    return event;
  }

  startRun(payload = {}) {
    return this.record("run_started", payload);
  }

  finishRun(payload = {}) {
    return this.record("run_finished", payload);
  }

  recordActionRequested(action = {}) {
    const actionId = action.actionId || action.id || `action-${randomUUID()}`;
    return this.record("action_requested", { ...action, actionId });
  }

  recordPolicyDecision(actionId, decision = {}) {
    return this.record("policy_decision", { actionId, ...decision });
  }

  recordApprovalRequested(actionId, approval = {}) {
    return this.record("approval_requested", { actionId, ...approval });
  }

  recordApprovalDecision(actionId, approval = {}) {
    return this.record("approval_decision", { actionId, ...approval });
  }

  recordActionExecuted(actionId, result = {}) {
    return this.record("action_executed", { actionId, result });
  }

  recordActionFailed(actionId, error = {}) {
    const normalizedError = error instanceof Error ? { name: error.name, message: error.message } : error;
    return this.record("action_failed", { actionId, error: normalizedError });
  }

  async wrapAction(action = {}, executor) {
    if (typeof executor !== "function") throw new Error("wrapAction requires an executor function");
    const requested = this.recordActionRequested(action);
    const actionId = requested.payload.actionId;
    try {
      const result = await executor(action);
      this.recordActionExecuted(actionId, result);
      return result;
    } catch (error) {
      this.recordActionFailed(actionId, error);
      throw error;
    }
  }

  list() {
    return this.sink.list();
  }
}
