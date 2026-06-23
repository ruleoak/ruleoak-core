import { existsSync } from "node:fs";
import { loadRuleOakManifest, validateRuleOakManifest } from "./ruleoak-yml-standard.js";
import { ToolRiskScanner } from "./tool-risk-scanner.js";

export function runAgentSafetyCi({ manifestPath = ".ruleoak.yml", tools = [], failOnHighRiskWithoutPolicy = true } = {}) {
  const findings = [];
  let manifest = null;
  let manifestValidation = null;
  if (existsSync(manifestPath)) {
    manifest = loadRuleOakManifest(manifestPath);
    manifestValidation = validateRuleOakManifest(manifest);
    if (!manifestValidation.ok) findings.push(...manifestValidation.errors.map((message) => ({ severity: "error", message })));
  } else {
    findings.push({ severity: "error", message: `.ruleoak.yml not found at ${manifestPath}` });
  }

  const scanner = new ToolRiskScanner();
  const scan = scanner.scanTools(tools.length ? tools : manifestValidation?.manifest?.tools || []);
  const policy = manifestValidation?.manifest?.permissions || { allowedActions: [], blockedActions: [], approvalRequired: [], dryRunOnly: [] };
  const governed = new Set([...policy.allowedActions, ...policy.blockedActions, ...policy.approvalRequired, ...policy.dryRunOnly]);

  for (const result of scan.results) {
    if ((result.risk === "high" || result.risk === "unknown") && !governed.has(result.name)) {
      findings.push({ severity: failOnHighRiskWithoutPolicy ? "error" : "warning", message: `${result.name} is ${result.risk} risk but has no RuleOak policy entry` });
    }
    if (!result.inputSchemaPresent) findings.push({ severity: "warning", message: `${result.name} has no input schema` });
  }

  const errors = findings.filter((f) => f.severity === "error");
  return {
    schemaVersion: "ruleoak.agent_safety_ci.v1",
    ok: errors.length === 0,
    exitCode: errors.length ? 1 : 0,
    manifest: manifestValidation,
    scan,
    findings,
    markdown: renderAgentSafetyCiMarkdown({ findings, scan, ok: errors.length === 0 })
  };
}

export function renderAgentSafetyCiMarkdown(report = {}) {
  const lines = ["# RuleOak Agent Safety CI", "", `Result: ${report.ok ? "PASS" : "FAIL"}`, "", "## Findings", ""];
  if (!report.findings?.length) lines.push("No findings.");
  for (const finding of report.findings || []) lines.push(`- ${finding.severity.toUpperCase()}: ${finding.message}`);
  if (report.scan) {
    lines.push("", "## Tool risk summary", "", `Total tools: ${report.scan.counts.total}`, `High: ${report.scan.counts.high}`, `Medium: ${report.scan.counts.medium}`, `Low: ${report.scan.counts.low}`, `Unknown: ${report.scan.counts.unknown}`);
  }
  return lines.join("\n");
}
