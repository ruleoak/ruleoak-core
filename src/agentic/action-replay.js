import { readEvidenceJsonl } from "./flight-recorder.js";

function compareTimestamp(a, b) {
  return String(a.timestamp || "").localeCompare(String(b.timestamp || "")) || (a.sequence || 0) - (b.sequence || 0);
}

function eventActionId(event = {}) {
  return event.payload?.actionId || event.payload?.action?.actionId || event.payload?.requestId || null;
}

function summarizeEvent(event = {}) {
  const payload = event.payload || {};
  if (event.type === "action_requested") return `requested ${payload.toolName || payload.tool || payload.action || "action"}${payload.operation ? `.${payload.operation}` : ""}`;
  if (event.type === "policy_decision") return `decision ${payload.decision || payload.policyDecision || "unknown"}${payload.risk ? ` risk=${payload.risk}` : ""}`;
  if (event.type === "approval_requested") return `approval requested ${payload.status || "pending"}`;
  if (event.type === "approval_decision") return `approval ${payload.decision || payload.status || "recorded"}`;
  if (event.type === "action_executed") return "executed";
  if (event.type === "action_failed") return `failed ${payload.error?.message || ""}`.trim();
  if (event.type === "run_started") return "run started";
  if (event.type === "run_finished") return "run finished";
  return event.type || "event";
}

export function buildActionTimeline(events = [], filters = {}) {
  const filtered = events.filter((event) => {
    if (filters.runId && event.runId !== filters.runId) return false;
    if (filters.sessionId && event.sessionId !== filters.sessionId) return false;
    if (filters.type && event.type !== filters.type) return false;
    if (filters.toolName && event.payload?.toolName !== filters.toolName && event.payload?.tool !== filters.toolName) return false;
    if (filters.decision && event.payload?.decision !== filters.decision && event.payload?.policyDecision !== filters.decision) return false;
    if (filters.risk && event.payload?.risk !== filters.risk) return false;
    if (filters.since && String(event.timestamp || "") < filters.since) return false;
    if (filters.until && String(event.timestamp || "") > filters.until) return false;
    return true;
  }).sort(compareTimestamp);

  return filtered.map((event, index) => ({
    index: index + 1,
    timestamp: event.timestamp,
    runId: event.runId,
    sessionId: event.sessionId,
    sequence: event.sequence,
    type: event.type,
    actor: event.actor,
    actionId: eventActionId(event),
    toolName: event.payload?.toolName || event.payload?.tool || event.payload?.action?.toolName || null,
    operation: event.payload?.operation || event.payload?.action?.operation || null,
    decision: event.payload?.decision || event.payload?.policyDecision || null,
    risk: event.payload?.risk || null,
    summary: summarizeEvent(event),
    payload: event.payload || {}
  }));
}

export function loadActionTimelineFromJsonl(filePath, filters = {}) {
  return buildActionTimeline(readEvidenceJsonl(filePath), filters);
}

export function renderTimelineText(timeline = []) {
  if (!timeline.length) return "RuleOak Agent Action Replay\n(no matching events)";
  const lines = ["RuleOak Agent Action Replay", "==========================="];
  for (const event of timeline) {
    const action = event.actionId ? ` action=${event.actionId}` : "";
    const tool = event.toolName ? ` tool=${event.toolName}` : "";
    const decision = event.decision ? ` decision=${event.decision}` : "";
    const risk = event.risk ? ` risk=${event.risk}` : "";
    lines.push(`${String(event.index).padStart(3, "0")} ${event.timestamp || "no-time"} ${event.type}${action}${tool}${decision}${risk} :: ${event.summary}`);
  }
  return lines.join("\n");
}

export function renderTimelineMarkdown(timeline = [], { title = "RuleOak Agent Action Replay" } = {}) {
  const lines = [`# ${title}`, "", `Events: ${timeline.length}`, "", "| # | Time | Type | Action | Tool | Decision | Risk | Summary |", "|---:|---|---|---|---|---|---|---|"];
  for (const event of timeline) {
    lines.push(`| ${event.index} | ${event.timestamp || ""} | ${event.type || ""} | ${event.actionId || ""} | ${event.toolName || ""} | ${event.decision || ""} | ${event.risk || ""} | ${String(event.summary || "").replace(/\|/g, "\\|")} |`);
  }
  return lines.join("\n");
}

export class AgentActionReplay {
  constructor({ events = [], filePath = null, filters = {} } = {}) {
    this.events = filePath ? readEvidenceJsonl(filePath) : events;
    this.filters = filters;
  }

  timeline(filters = {}) {
    return buildActionTimeline(this.events, { ...this.filters, ...filters });
  }

  toText(filters = {}) {
    return renderTimelineText(this.timeline(filters));
  }

  toMarkdown(filters = {}) {
    return renderTimelineMarkdown(this.timeline(filters));
  }
}
