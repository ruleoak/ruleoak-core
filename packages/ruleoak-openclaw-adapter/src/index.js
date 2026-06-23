import { AgentFirewall, FlightRecorder } from "../../../src/agentic/index.js";
import { databaseDecisionToRuleOakAction, filesystemDecisionToRuleOakAction } from "../../../src/agentic/guards/index.js";

export const OPENCLAW_STYLE_ADAPTER_VERSION = "1.0.0";
export const OPENCLAW_STYLE_ACTION_CATEGORIES = [
  "filesystem.read", "filesystem.write", "filesystem.delete", "shell.run", "database.query", "database.mutate",
  "email.send", "calendar.write", "browser.automate", "skill.install", "secret.read"
];

const ACTION_MAP = {
  "filesystem.delete": ["filesystem", "delete"],
  "filesystem.write": ["filesystem", "write"],
  "filesystem.read": ["filesystem", "read"],
  "database.query": ["database", "query"],
  "database.mutate": ["database", "mutation"],
  "database.drop": ["database", "destructive_ddl"],
  "system.run": ["shell", "run"],
  "shell.run": ["shell", "run"],
  "email.send": ["email", "send"],
  "calendar.write": ["calendar", "write"],
  "calendar.update": ["calendar", "write"],
  "browser.automate": ["browser", "automate"],
  "browser.purchase": ["browser", "purchase"],
  "skill.install": ["skill", "install"],
  "secret.read": ["secret", "read"],
  "secrets.read": ["secret", "read"]
};

export function normalizeOpenClawAction(input = {}) {
  if (!input || typeof input !== "object") return { toolName: "unknown", operation: "unknown", target: null, risk: "high", input: { invalid: true } };
  const kind = input.kind || input.type || input.action || input.tool || input.category || "unknown";
  if (kind.startsWith("filesystem.")) return filesystemDecisionToRuleOakAction({ operation: kind.split(".")[1], path: input.path || input.target, input }, input.policy || {});
  if (kind.startsWith("database.")) return databaseDecisionToRuleOakAction({ operation: kind.split(".")[1], sql: input.sql || input.query, input, database: input.database }, input.policy || {});
  const [toolName, operation] = ACTION_MAP[kind] || [String(kind).split(".")[0] || "unknown", String(kind).split(".")[1] || kind];
  const risky = ["delete", "mutation", "destructive_ddl", "run", "send", "purchase", "install", "read", "automate", "write"].includes(operation) && !(toolName === "filesystem" && operation === "read");
  return { toolName, operation, target: input.target || input.path || input.database || input.recipient || null, risk: risky ? "high" : "low", input, metadata: { adapter: "openclaw-style", sourceKind: kind } };
}

export function createOpenClawPolicy(overrides = {}) {
  return {
    allowedActions: ["filesystem.read", "search.read", "database.query", ...(overrides.allowedActions || [])],
    approvalRequired: ["email.send", "calendar.write", "filesystem.write", "database.mutation", "browser.automate", ...(overrides.approvalRequired || [])],
    blockedActions: ["filesystem.delete", "shell.run", "browser.purchase", "skill.install", "secret.read", "database.destructive_ddl", ...(overrides.blockedActions || [])]
  };
}

export function evaluateOpenClawAction(input = {}, policy = createOpenClawPolicy()) {
  const action = normalizeOpenClawAction(input);
  const recorder = new FlightRecorder({ actor: "openclaw-style-agent" });
  const firewall = new AgentFirewall({ policy, recorder, actor: "openclaw-style-agent" });
  const decision = firewall.evaluateAction(action);
  return { action, decision, evidence: recorder.list(), version: OPENCLAW_STYLE_ADAPTER_VERSION };
}

export async function recordOpenClawAction(input = {}, executor = async () => ({ ok: true }), policy = createOpenClawPolicy()) {
  const action = normalizeOpenClawAction(input);
  const recorder = new FlightRecorder({ actor: "openclaw-style-agent" });
  const firewall = new AgentFirewall({ policy, recorder, actor: "openclaw-style-agent" });
  const result = await firewall.guardAction(action, executor);
  return { action, result, evidence: recorder.list(), version: OPENCLAW_STYLE_ADAPTER_VERSION };
}

export function createOpenClawRuleOakMiddleware({ policy = createOpenClawPolicy(), recorder = new FlightRecorder({ actor: "openclaw-style-agent" }) } = {}) {
  const firewall = new AgentFirewall({ policy, recorder, actor: "openclaw-style-agent" });
  return async function ruleoakOpenClawMiddleware(input, next = async () => ({ ok: true })) {
    const action = normalizeOpenClawAction(input);
    return firewall.guardAction(action, () => next(input));
  };
}

export function createOpenClawEvidenceSink({ actor = "openclaw-style-agent" } = {}) {
  return new FlightRecorder({ actor });
}
