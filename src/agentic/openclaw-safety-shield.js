import { AgentFirewall } from "./agent-firewall.js";
import { FlightRecorder } from "./flight-recorder.js";

const ACTION_MAP = {
  email_send: { toolName: "email", operation: "send", risk: "medium" },
  file_delete: { toolName: "filesystem", operation: "delete", risk: "high" },
  file_write: { toolName: "filesystem", operation: "write", risk: "medium" },
  shell_run: { toolName: "shell", operation: "execute", risk: "high" },
  calendar_update: { toolName: "calendar", operation: "update", risk: "medium" },
  browser_purchase: { toolName: "browser", operation: "spend", risk: "high" },
  read_context: { toolName: "context", operation: "read", risk: "low" }
};

function normalizeOpenClawAction(action = {}) {
  const type = action.type || action.capability || action.action || "unknown";
  const mapped = ACTION_MAP[type] || {};
  return {
    actionId: action.id || action.actionId,
    action: type,
    toolName: action.toolName || mapped.toolName || action.tool || type,
    operation: action.operation || mapped.operation || type,
    target: action.target || action.to || action.path || action.resource || null,
    input: action.input || action.arguments || action.payload || action,
    risk: action.risk || mapped.risk,
    actor: action.actor || "openclaw-style-agent",
    metadata: { ...(action.metadata || {}), adapter: "openclaw-style", sourceType: type }
  };
}

export class OpenClawSafetyShield {
  constructor({ policy = null, recorder = null, firewall = null, runId, actor = "openclaw-style-agent", handlers = {}, clock } = {}) {
    this.recorder = recorder || new FlightRecorder({ runId, actor, clock });
    this.firewall = firewall || new AgentFirewall({
      policy: policy || OpenClawSafetyShield.defaultPolicy(),
      recorder: this.recorder,
      actor,
      runId,
      clock
    });
    this.handlers = handlers;
    this.actions = [];
  }

  static defaultPolicy() {
    return {
      allowedActions: ["context", "context.read", "read_context"],
      approvalRequired: ["email", "email.send", "calendar", "calendar.update", "filesystem.write"],
      blockedActions: ["filesystem.delete", "shell", "shell.execute", "browser.spend"],
      boundary: "local_first_openclaw_style_demo"
    };
  }

  mapAction(action = {}) {
    return normalizeOpenClawAction(action);
  }

  async handleAction(action = {}) {
    const normalized = this.mapAction(action);
    const handler = this.handlers[normalized.action] || this.handlers[normalized.toolName] || (async () => ({ ok: true, dryRun: true, simulated: true }));
    const result = await this.firewall.guardAction(normalized, handler);
    const record = { sourceAction: action, normalizedAction: normalized, ...result };
    this.actions.push(record);
    return record;
  }

  async handleActions(actions = []) {
    if (!Array.isArray(actions)) throw new Error("handleActions expects an array");
    const results = [];
    for (const action of actions) results.push(await this.handleAction(action));
    return results;
  }

  report(options = {}) {
    return {
      ...this.firewall.report({ title: "RuleOak OpenClaw-Style Safety Shield Report", summary: "OpenClaw-style personal-agent actions governed before execution.", ...options }),
      runtimeStage: "openclaw-style-safety-shield",
      actionCount: this.actions.length,
      actions: this.actions.map((record) => ({
        normalizedAction: record.normalizedAction,
        decision: record.decision?.decision,
        executed: record.executed,
        reason: record.decision?.reason
      })),
      boundaryNote: "This is an OpenClaw-style adapter/shield pattern using mockable action envelopes. It does not claim official OpenClaw integration."
    };
  }
}
