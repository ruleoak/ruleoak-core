import { validateRuleOakManifest } from "./ruleoak-yml-standard.js";
import { scanToolRisks } from "./tool-risk-scanner.js";

export function calculateAgentTrustScore({ manifest = {}, tools = [], evidenceValidation = null, safetyCi = null, replaySupported = false } = {}) {
  const checks = [];
  let score = 0;
  const manifestValidation = validateRuleOakManifest(manifest);
  const toolScan = scanToolRisks(tools.length ? tools : manifestValidation.manifest.tools || []);
  function add(name, points, passed, detail) {
    checks.push({ name, points, passed, detail });
    if (passed) score += points;
  }
  add("valid manifest", 15, manifestValidation.ok, manifestValidation.errors.join("; ") || "manifest validates");
  add("evidence enabled", 15, manifestValidation.manifest.evidence.enabled, "evidence.enabled=true");
  add("redaction enabled", 10, manifestValidation.manifest.redaction.enabled, "redaction.enabled=true");
  add("approval gates", 15, manifestValidation.manifest.permissions.approvalRequired.length > 0 || manifestValidation.manifest.approval.requiredForHighRisk === true, "approval required for high-risk actions");
  add("blocked dangerous actions", 10, manifestValidation.manifest.permissions.blockedActions.length > 0, "blocked action list is present");
  add("tool risk scan", 10, toolScan.counts.high === 0 || manifestValidation.manifest.permissions.blockedActions.length + manifestValidation.manifest.permissions.approvalRequired.length > 0, "high-risk tools governed");
  add("evidence format validation", 10, evidenceValidation ? evidenceValidation.ok : manifestValidation.manifest.evidence.format === "jsonl", "JSONL evidence");
  add("replay supported", 10, replaySupported || manifestValidation.manifest.evidence.replayable, "timeline replay available");
  add("safety CI", 5, safetyCi ? safetyCi.ok : false, "agent safety CI passes");
  const capped = Math.max(0, Math.min(100, score));
  return { schemaVersion: "ruleoak.agent_trust_score.v1", score: capped, grade: capped >= 85 ? "A" : capped >= 70 ? "B" : capped >= 50 ? "C" : "D", checks, manifestValidation, toolScan, disclaimer: "RuleOak Agent Trust Score is not certification, audit opinion, or legal compliance proof." };
}

export function renderAgentTrustScoreMarkdown(report = {}) {
  const lines = ["# RuleOak Agent Trust Score", "", `Score: ${report.score}/100`, `Grade: ${report.grade}`, "", "| Check | Points | Pass | Detail |", "|---|---:|---|---|"];
  for (const c of report.checks || []) lines.push(`| ${c.name} | ${c.points} | ${c.passed ? "yes" : "no"} | ${String(c.detail || "").replace(/\|/g, "\\|")} |`);
  lines.push("", `Disclaimer: ${report.disclaimer}`);
  return lines.join("\n");
}
