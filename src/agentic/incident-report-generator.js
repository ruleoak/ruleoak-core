import { buildActionTimeline } from "./action-replay.js";
import { validateEvidenceEvent } from "./evidence-jsonl-format.js";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
}

export function generateAgentIncidentReport(events = [], { title = "RuleOak Agent Incident Report", incidentId = `incident-${Date.now()}` } = {}) {
  const timeline = buildActionTimeline(events);
  const invalidEvents = events.map((event, index) => ({ index, validation: validateEvidenceEvent(event) })).filter((entry) => !entry.validation.ok);
  const denied = timeline.filter((e) => e.decision === "deny");
  const approval = timeline.filter((e) => e.type === "approval_requested" || e.type === "approval_decision");
  const failures = timeline.filter((e) => e.type === "action_failed");
  const highRisk = timeline.filter((e) => e.risk === "high");
  const severity = failures.length || denied.length || highRisk.length ? "review_required" : "informational";
  const report = { schemaVersion: "ruleoak.agent_incident_report.v1", incidentId, title, severity, counts: { events: events.length, timeline: timeline.length, denied: denied.length, approval: approval.length, failures: failures.length, highRisk: highRisk.length, invalidEvents: invalidEvents.length }, timeline, invalidEvents };
  report.markdown = renderIncidentReportMarkdown(report);
  report.html = renderIncidentReportHtml(report);
  return report;
}

export function renderIncidentReportMarkdown(report = {}) {
  const lines = [
    `# ${report.title || "RuleOak Agent Incident Report"}`,
    "",
    `Incident ID: ${report.incidentId}`,
    `Severity: ${report.severity}`,
    "",
    "## Summary",
    "",
    `- Events: ${report.counts?.events ?? 0}`,
    `- Denied actions: ${report.counts?.denied ?? 0}`,
    `- Approval events: ${report.counts?.approval ?? 0}`,
    `- Failed actions: ${report.counts?.failures ?? 0}`,
    `- High-risk timeline entries: ${report.counts?.highRisk ?? 0}`,
    "",
    "## Timeline",
    "",
    "| # | Time | Type | Tool | Decision | Risk | Summary |",
    "|---:|---|---|---|---|---|---|"
  ];
  for (const e of report.timeline || []) lines.push(`| ${e.index} | ${e.timestamp || ""} | ${e.type || ""} | ${e.toolName || ""} | ${e.decision || ""} | ${e.risk || ""} | ${String(e.summary || "").replace(/\|/g, "\\|")} |`);
  if (report.invalidEvents?.length) lines.push("", "## Missing or invalid evidence", "", ...report.invalidEvents.map((e) => `- Event ${e.index}: ${e.validation.errors.join("; ")}`));
  lines.push("", "## Boundary note", "", "This report is generated from available RuleOak evidence. It is not legal, regulatory, or security certification.");
  return lines.join("\n");
}

export function renderIncidentReportHtml(report = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title></head><body><pre>${escapeHtml(report.markdown || renderIncidentReportMarkdown(report))}</pre></body></html>`;
}
