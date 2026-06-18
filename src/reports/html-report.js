import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { summarizeReport } from "./report-catalog.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function pretty(value) {
  return escapeHtml(JSON.stringify(value, null, 2));
}

function section(title, body) {
  return `<section class="card"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function recordList(records, emptyText = "No records") {
  if (!records.length) return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  return `<div class="records">${records.map((record) => `<pre>${pretty(record)}</pre>`).join("")}</div>`;
}

export function renderReport(report = {}, { sourcePath = "report.json" } = {}) {
  const summary = summarizeReport(report, sourcePath);
  const evidence = asArray(report.evidence);
  const auditEvents = asArray(report.auditEvents);
  const toolDecisions = asArray(report.toolDecisions);
  const policyDecisions = asArray(report.policyDecisions);
  const approvals = asArray(report.approvals);
  const title = `RuleOak Report — ${summary.title}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{--bg:#f6f8f4;--panel:#fff;--ink:#18242f;--muted:#607080;--line:#d9e4df;--green:#135f3c;--gold:#c9941e;--code:#0f1720}
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:linear-gradient(180deg,#fbfcfa 0%,#eef5f2 100%);color:var(--ink);line-height:1.55;padding:36px}main{max-width:1060px;margin:0 auto}.hero{background:linear-gradient(135deg,rgba(19,95,60,.10),rgba(201,148,30,.11));border:1px solid var(--line);border-radius:28px;padding:30px;margin-bottom:22px;box-shadow:0 18px 44px rgba(18,36,47,.08)}.eyebrow{text-transform:uppercase;letter-spacing:.14em;color:var(--green);font-weight:800;font-size:.78rem;margin:0 0 8px}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.05;letter-spacing:-.03em;margin:0 0 12px}h2{margin:0 0 14px;font-size:1.25rem}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:20px}.metric{background:rgba(255,255,255,.78);border:1px solid var(--line);border-radius:18px;padding:16px}.metric strong{display:block;font-size:1.8rem;color:var(--green)}.card{background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:22px;margin:16px 0;box-shadow:0 12px 30px rgba(18,36,47,.06)}.muted{color:var(--muted)}pre{white-space:pre-wrap;overflow:auto;background:var(--code);color:#eef5ff;border-radius:16px;padding:16px;font-size:.88rem}.records{display:grid;gap:12px}.pill{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#eaf4ee;color:var(--green);font-weight:800;margin-right:8px}.source{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--muted);font-size:.9rem}@media(max-width:760px){body{padding:18px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
  <header class="hero">
    <p class="eyebrow">RuleOak local audit report</p>
    <h1>${escapeHtml(summary.title)}</h1>
    <p class="muted">Source: <span class="source">${escapeHtml(sourcePath)}</span></p>
    <p><span class="pill">${escapeHtml(summary.status)}</span><span class="pill">${escapeHtml(summary.runtimeVersion)}</span></p>
    <div class="grid">
      <div class="metric"><strong>${summary.counts.evidence}</strong>Evidence</div>
      <div class="metric"><strong>${summary.counts.toolDecisions}</strong>Tool decisions</div>
      <div class="metric"><strong>${summary.counts.auditEvents}</strong>Audit events</div>
    </div>
  </header>
  ${section("Summary", `<pre>${pretty(summary)}</pre>`)}
  ${section("Policy decisions", recordList(policyDecisions, "No policy decisions"))}
  ${section("Approvals", recordList(approvals, "No approvals"))}
  ${section("Tool decisions", recordList(toolDecisions, "No tool decisions"))}
  ${section("Evidence", recordList(evidence, "No evidence records"))}
  ${section("Audit events", recordList(auditEvents, "No audit events"))}
  ${section("Raw report", `<pre>${pretty(report)}</pre>`)}
</main>
</body>
</html>`;
}

export function renderReportFile(inputPath, outputPath) {
  const report = JSON.parse(readFileSync(inputPath, "utf8"));
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, renderReport(report, { sourcePath: inputPath }));
  return outputPath;
}
