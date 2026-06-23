function esc(value) { return String(value ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
function sortTimeline(caseRecord) { return [...(caseRecord.timeline || [])].sort((a,b)=>String(a.occurredAt).localeCompare(String(b.occurredAt))); }

export const REPORT_TEMPLATES = {
  aiAction: "AI action report",
  home: "Home incident case pack",
  travel: "Travel claim/refund pack",
  creator: "Creator proof pack",
  freelancer: "Freelancer approval and scope pack",
  knowledge: "Personal research evidence brief"
};

export function reportTitleFor(caseRecord) {
  return REPORT_TEMPLATES[caseRecord.vertical] || REPORT_TEMPLATES.aiAction;
}

export function renderCaseReportMarkdown(caseRecord, options = {}) {
  const title = options.title || reportTitleFor(caseRecord);
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`**Case:** ${caseRecord.title}`);
  lines.push(`**Case ID:** ${caseRecord.caseId}`);
  lines.push(`**Status:** ${caseRecord.status}`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(caseRecord.summary || "No summary provided.");
  lines.push("");
  lines.push("## Timeline");
  for (const event of sortTimeline(caseRecord)) {
    lines.push(`- **${event.occurredAt}** — ${event.title}${event.decision ? ` (${event.decision})` : ""}`);
    if (event.summary) lines.push(`  - ${event.summary}`);
  }
  if (!caseRecord.timeline?.length) lines.push("- No timeline events recorded yet.");
  lines.push("");
  lines.push("## Evidence");
  for (const ev of caseRecord.evidenceItems || []) {
    lines.push(`- **${ev.title}** — ${ev.type}; captured ${ev.capturedAt}`);
    if (ev.summary) lines.push(`  - ${ev.summary}`);
  }
  if (!caseRecord.evidenceItems?.length) lines.push("- No evidence items recorded yet.");
  lines.push("");
  lines.push("## Missing evidence / follow-up");
  const openReminders = (caseRecord.reminders || []).filter(r => r.status !== "done");
  if (openReminders.length) for (const r of openReminders) lines.push(`- ${r.title} — due ${r.dueAt}`); else lines.push("- None recorded.");
  lines.push("");
  lines.push("## Important limitation");
  lines.push("This report is a personal evidence record generated from local user-provided data. It is not legal, insurance, visa, copyright, financial, medical, or regulatory advice and does not guarantee any outcome.");
  return lines.join("\n");
}

export function renderCaseReportHtml(caseRecord, options = {}) {
  const markdown = renderCaseReportMarkdown(caseRecord, options);
  const body = markdown.split("\n").map(line => {
    if (line.startsWith("# ")) return `<h1>${esc(line.slice(2))}</h1>`;
    if (line.startsWith("## ")) return `<h2>${esc(line.slice(3))}</h2>`;
    if (line.startsWith("- ")) return `<li>${esc(line.slice(2))}</li>`;
    if (!line.trim()) return "";
    return `<p>${esc(line)}</p>`;
  }).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(caseRecord.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:880px;margin:40px auto;padding:0 20px;line-height:1.5}h1,h2{color:#233}li{margin:8px 0}</style></head><body>${body}</body></html>`;
}
