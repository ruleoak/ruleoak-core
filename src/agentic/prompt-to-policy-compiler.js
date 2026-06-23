const RULE_PATTERNS = [
  { re: /^no\s+(.+?)\s+without\s+approval$/i, effect: "approvalRequired" },
  { re: /^require\s+approval\s+for\s+(.+)$/i, effect: "approvalRequired" },
  { re: /^block\s+(.+)$/i, effect: "blockedActions" },
  { re: /^deny\s+(.+)$/i, effect: "blockedActions" },
  { re: /^allow\s+(.+)$/i, effect: "allowedActions" },
  { re: /^dry\s*run\s+only\s+for\s+(.+)$/i, effect: "dryRunOnly" },
  { re: /^record\s+evidence\s+for\s+(.+)$/i, effect: "evidenceRequired" }
];

function normalizeActionText(text = "") {
  return String(text).trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_.:-]/g, "");
}

function splitRules(text = "") {
  return String(text).split(/\n|;|\.(?=\s+[A-Z])/).map((line) => line.trim()).filter(Boolean);
}

export function compileRuleOakPolicyFromPrompt(text = "") {
  const policy = { allowedActions: [], blockedActions: [], approvalRequired: [], dryRunOnly: [], evidenceRequired: [] };
  const warnings = [];
  const rejected = [];
  for (const rule of splitRules(text)) {
    let matched = false;
    for (const pattern of RULE_PATTERNS) {
      const match = rule.match(pattern.re);
      if (match) {
        const action = normalizeActionText(match[1]);
        if (!action || action === "all" || action === "everything" || action === "*") warnings.push(`broad rule requires review: ${rule}`);
        policy[pattern.effect].push(action);
        matched = true;
        break;
      }
    }
    if (!matched) rejected.push({ rule, reason: "not in supported constrained rule grammar" });
  }
  return {
    schemaVersion: "ruleoak.prompt_to_policy.v1",
    ok: rejected.length === 0,
    policy,
    warnings,
    rejected,
    reviewRequired: warnings.length > 0 || rejected.length > 0
  };
}

export function renderCompiledPolicyYaml(compilation = {}) {
  const p = compilation.policy || {};
  const lines = ["permissions:"];
  const keys = [["allowedActions", "allowedActions"], ["blockedActions", "blockedActions"], ["approvalRequired", "approvalRequired"], ["dryRunOnly", "dryRunOnly"]];
  for (const [key, label] of keys) {
    lines.push(`  ${label}:`);
    for (const item of p[key] || []) lines.push(`    - ${item}`);
    if (!(p[key] || []).length) lines.push("    []");
  }
  lines.push("evidence:", "  enabled: true", "  format: jsonl", "redaction:", "  enabled: true");
  return lines.join("\n");
}
