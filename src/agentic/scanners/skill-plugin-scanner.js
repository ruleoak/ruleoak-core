import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const PATTERNS = [
  ["shell", /\b(child_process|exec\(|spawn\(|system\.run|subprocess|os\.system)\b/i, 25],
  ["filesystem", /\b(fs\.|readFile|writeFile|unlink|rm\s+-rf|delete file|filesystem)\b/i, 15],
  ["network", /\b(fetch\(|axios|http\.request|requests\.|websocket|curl\b)\b/i, 12],
  ["credential", /\b(api[_-]?key|token|secret|password|cookie|private[_-]?key|secrets|\.env)\b/i, 30],
  ["clipboard", /\bclipboard|pbcopy|xclip|pasteboard\b/i, 10],
  ["browser_profile", /\b(browser profile|cookies|login data|chrome\/user data|firefox\/profiles)\b/i, 20],
  ["database", /\b(drop table|truncate table|sqlite|postgres|mysql|mongodb|database)\b/i, 18],
  ["persistence", /\b(cron|launchctl|systemd|startup|autorun|postinstall|preinstall)\b/i, 20]
];

function walk(dir, limit = 200) {
  if (!existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length && out.length < limit) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      if (["node_modules", ".git", "__pycache__"].includes(name)) continue;
      const path = join(current, name);
      const st = statSync(path);
      if (st.isDirectory()) stack.push(path);
      else if (st.isFile() && st.size <= 512_000) out.push(path);
    }
  }
  return out;
}

export function scanSkillPlugin(targetPath, options = {}) {
  const files = statSync(targetPath).isDirectory() ? walk(targetPath, options.fileLimit || 200) : [targetPath];
  const findings = [];
  for (const file of files) {
    if (!/[.](md|json|ya?ml|js|ts|py|txt|sh)$/i.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const [category, regex, score] of PATTERNS) {
      if (regex.test(text)) findings.push({ file, category, score, reason: `matched ${category} risk pattern` });
    }
  }
  const riskScore = Math.min(100, findings.reduce((sum, f) => sum + f.score, 0));
  const riskLevel = riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";
  const recommendedPolicy = {
    blockedActions: findings.some((f) => f.category === "credential") ? ["secrets.read"] : [],
    approvalRequired: [...new Set(findings.map((f) => `${f.category}.use`))],
    evidenceRequired: true
  };
  return { targetPath, filesScanned: files.length, riskScore, riskLevel, findings, recommendedPolicy };
}

export function renderSkillPluginScanMarkdown(report) {
  const rows = report.findings.map((f) => `| ${f.category} | ${f.file} | ${f.reason} |`).join("\n") || "| none | - | no risky patterns found |";
  return [`# Skill / plugin scan`, "", `Risk: **${report.riskLevel}** (${report.riskScore}/100)`, "", "| Category | File | Reason |", "|---|---|---|", rows, ""].join("\n");
}
