import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function summarizeReport(report = {}, sourcePath = "report.json") {
  const run = report.run || {};
  const summary = report.summary || {};
  const id = run.id || run.runId || report.runId || report.id || basename(sourcePath, ".json");
  const title = summary.title || summary.question || run.app || run.workflow || report.title || basename(sourcePath);
  return {
    id,
    title,
    sourcePath,
    status: run.status || report.status || "unknown",
    runtimeVersion: report.runtimeVersion || report.version || "unknown",
    generatedAt: report.generatedAt || report.createdAt || new Date().toISOString(),
    counts: {
      evidence: safeArray(report.evidence).length,
      auditEvents: safeArray(report.auditEvents).length,
      toolDecisions: safeArray(report.toolDecisions).length,
      policyDecisions: safeArray(report.policyDecisions).length,
      approvals: safeArray(report.approvals).length,
      records: safeArray(report.records).length
    },
    decisions: {
      policyDecision: summary.policyDecision || report.policyDecision || null,
      approvalDecision: summary.approvalDecision || report.approvalDecision || null,
      publishDecision: summary.publishDecision || null
    }
  };
}

export function buildReportCatalog(reportPaths = []) {
  const reports = [];
  for (const path of reportPaths) {
    if (!existsSync(path)) continue;
    try {
      const report = JSON.parse(readFileSync(path, "utf8"));
      reports.push(summarizeReport(report, path));
    } catch (error) {
      reports.push({
        id: basename(path, ".json"),
        title: basename(path),
        sourcePath: path,
        status: "unreadable",
        error: error.message,
        counts: { evidence: 0, auditEvents: 0, toolDecisions: 0, policyDecisions: 0, approvals: 0, records: 0 },
        decisions: {}
      });
    }
  }
  return {
    schema: "ruleoak.report_catalog.v1",
    generatedAt: new Date().toISOString(),
    reportCount: reports.length,
    reports
  };
}

export function writeReportCatalog(reportPaths = [], outputPath = "reports/html/catalog.json") {
  mkdirSync(dirname(outputPath), { recursive: true });
  const catalog = buildReportCatalog(reportPaths);
  writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
  return catalog;
}
