import { existsSync, readFileSync } from "node:fs";

const DANGEROUS_WILDCARDS = new Set(["*", "all", "everything", "*"]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasDangerousWildcard(list = []) {
  return list.some((item) => DANGEROUS_WILDCARDS.has(String(item).trim().toLowerCase()));
}


function parseScalarYaml(value = "") {
  const text = String(value).trim();
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  if (text.startsWith("[") && text.endsWith("]")) {
    const inner = text.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => parseScalarYaml(item.trim())) : [];
  }
  return text;
}

function parseSimpleYamlObject(text = "") {
  const raw = String(text).split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, ""))
    .filter((line) => line.trim().length);
  const entries = raw.map((line) => ({ indent: line.match(/^ */)[0].length, content: line.trim() }));
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (let i = 0; i < entries.length; i += 1) {
    const { indent, content } = entries[i];
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    if (content.startsWith("- ")) {
      if (!Array.isArray(parent)) throw new Error(`YAML list item has no list parent: ${content}`);
      parent.push(parseScalarYaml(content.slice(2)));
      continue;
    }
    const colon = content.indexOf(":");
    if (colon < 0) throw new Error(`unsupported YAML line: ${content}`);
    const key = content.slice(0, colon).trim();
    const rest = content.slice(colon + 1).trim();
    if (rest) {
      if (Array.isArray(parent)) parent.push({ [key]: parseScalarYaml(rest) });
      else parent[key] = parseScalarYaml(rest);
      continue;
    }
    const next = entries[i + 1];
    const child = next && next.indent > indent && next.content.startsWith("- ") ? [] : {};
    if (Array.isArray(parent)) parent.push({ [key]: child });
    else parent[key] = child;
    stack.push({ indent, value: child });
  }
  return root;
}

export const RULEOAK_MANIFEST_VERSION = "ruleoak.manifest.v1";

export function parseRuleOakManifestText(text = "") {
  const source = String(text);
  const parsed = source.trim().startsWith("{") ? JSON.parse(source) : parseSimpleYamlObject(source);
  if (!parsed || typeof parsed !== "object") throw new Error(".ruleoak.yml must contain a YAML object");
  return parsed;
}

export function loadRuleOakManifest(filePath = ".ruleoak.yml") {
  if (!existsSync(filePath)) throw new Error(`RuleOak manifest not found: ${filePath}`);
  return parseRuleOakManifestText(readFileSync(filePath, "utf8"));
}

export function normalizeRuleOakManifest(manifest = {}) {
  const agent = manifest.agent || {};
  const permissions = manifest.permissions || manifest.policy || {};
  const evidence = manifest.evidence || {};
  const approval = manifest.approval || {};
  const redaction = manifest.redaction || {};
  return {
    version: manifest.version || manifest.schemaVersion || RULEOAK_MANIFEST_VERSION,
    project: manifest.project || { name: manifest.name || "unnamed-ruleoak-project" },
    agent: {
      name: agent.name || manifest.agentName || "agent",
      description: agent.description || "",
      runtime: agent.runtime || "generic"
    },
    permissions: {
      allowedActions: asArray(permissions.allowedActions || permissions.allowed_actions),
      blockedActions: asArray(permissions.blockedActions || permissions.blocked_actions),
      approvalRequired: asArray(permissions.approvalRequired || permissions.approval_required),
      dryRunOnly: asArray(permissions.dryRunOnly || permissions.dry_run_only)
    },
    tools: asArray(manifest.tools),
    approval: {
      requiredForHighRisk: approval.requiredForHighRisk ?? approval.required_for_high_risk ?? true,
      expiryMinutes: approval.expiryMinutes ?? approval.expiry_minutes ?? 30
    },
    evidence: {
      enabled: evidence.enabled ?? true,
      format: evidence.format || "jsonl",
      path: evidence.path || "./.ruleoak/evidence.jsonl",
      replayable: evidence.replayable ?? true
    },
    redaction: {
      enabled: redaction.enabled ?? true,
      patterns: asArray(redaction.patterns || ["secret", "token", "password", "apiKey", "authorization", "cookie"])
    },
    policyPacks: asArray(manifest.policyPacks || manifest.policy_packs)
  };
}

export function validateRuleOakManifest(manifest = {}) {
  const normalized = normalizeRuleOakManifest(manifest);
  const errors = [];
  const warnings = [];
  if (!normalized.version) errors.push("version is required");
  if (!String(normalized.version).startsWith("ruleoak.")) warnings.push("version should use a RuleOak schema name such as ruleoak.manifest.v1");
  if (!normalized.project?.name) errors.push("project.name is required");
  if (!normalized.agent?.name) errors.push("agent.name is required");
  if (normalized.evidence.enabled && normalized.evidence.format !== "jsonl") errors.push("evidence.format must be jsonl in this release");
  if (normalized.redaction.enabled === false) warnings.push("redaction is disabled; this is unsafe for agent evidence");
  if (hasDangerousWildcard(normalized.permissions.allowedActions)) errors.push("permissions.allowedActions must not broadly allow all actions");
  if (!normalized.permissions.blockedActions.length && !normalized.permissions.approvalRequired.length && !normalized.policyPacks.length) {
    warnings.push("manifest has no blocked actions, approval gates, or policy packs");
  }
  for (const tool of normalized.tools) {
    if (!tool.name && !tool.id) errors.push("each tool must include name or id");
  }
  return { ok: errors.length === 0, errors, warnings, manifest: normalized };
}

export function ruleOakManifestToPolicy(manifest = {}) {
  const normalized = normalizeRuleOakManifest(manifest);
  return {
    allowedActions: normalized.permissions.allowedActions,
    blockedActions: normalized.permissions.blockedActions,
    approvalRequired: normalized.permissions.approvalRequired,
    dryRunOnly: normalized.permissions.dryRunOnly,
    evidence: normalized.evidence,
    redaction: normalized.redaction,
    policyPacks: normalized.policyPacks
  };
}

export function generateRuleOakManifestSummary(manifest = {}) {
  const validation = validateRuleOakManifest(manifest);
  const m = validation.manifest;
  const lines = [
    `# RuleOak Manifest Summary`,
    "",
    `Project: ${m.project.name}`,
    `Agent: ${m.agent.name}`,
    `Runtime: ${m.agent.runtime}`,
    `Evidence: ${m.evidence.enabled ? `${m.evidence.format} at ${m.evidence.path}` : "disabled"}`,
    `Redaction: ${m.redaction.enabled ? "enabled" : "disabled"}`,
    "",
    "## Permissions",
    "",
    `- Allowed: ${m.permissions.allowedActions.join(", ") || "none declared"}`,
    `- Approval required: ${m.permissions.approvalRequired.join(", ") || "none declared"}`,
    `- Dry-run only: ${m.permissions.dryRunOnly.join(", ") || "none declared"}`,
    `- Blocked: ${m.permissions.blockedActions.join(", ") || "none declared"}`,
    "",
    `Validation: ${validation.ok ? "pass" : "fail"}`
  ];
  if (validation.errors.length) lines.push("", "Errors:", ...validation.errors.map((e) => `- ${e}`));
  if (validation.warnings.length) lines.push("", "Warnings:", ...validation.warnings.map((w) => `- ${w}`));
  return lines.join("\n");
}
