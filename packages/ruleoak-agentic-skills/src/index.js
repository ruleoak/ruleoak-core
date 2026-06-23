import { existsSync, readFileSync } from "node:fs";
import { calculateAgentTrustScore, generateRuleOakManifestSummary, validateRuleOakManifest } from "../../../src/agentic/index.js";

export const AGENTIC_SKILL_MANIFEST_VERSION = "ruleoak.skill.v1";

function parseScalar(value = "") {
  const text = String(value).trim();
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

function parseSimpleYaml(text = "") {
  const lines = String(text).split(/\r?\n/).map((line) => line.replace(/\s+#.*$/, "")).filter((line) => line.trim());
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const indent = raw.match(/^ */)[0].length;
    const content = raw.trim();
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    if (content.startsWith("- ")) {
      if (!Array.isArray(parent)) throw new Error(`YAML list item has no list parent: ${content}`);
      parent.push(parseScalar(content.slice(2)));
      continue;
    }
    const colon = content.indexOf(":");
    if (colon < 0) throw new Error(`unsupported YAML line: ${content}`);
    const key = content.slice(0, colon).trim();
    const rest = content.slice(colon + 1).trim();
    if (rest) {
      if (Array.isArray(parent)) parent.push({ [key]: parseScalar(rest) });
      else parent[key] = parseScalar(rest);
      continue;
    }
    const next = lines[i + 1];
    const child = next && next.match(/^ */)[0].length > indent && next.trim().startsWith("- ") ? [] : {};
    if (Array.isArray(parent)) parent.push({ [key]: child });
    else parent[key] = child;
    stack.push({ indent, value: child });
  }
  return root;
}

export function parseSkillManifestText(text) {
  const source = String(text || "");
  const doc = source.trim().startsWith("{") ? JSON.parse(source) : parseSimpleYaml(source);
  if (!doc || typeof doc !== "object") throw new Error("skill manifest must be an object");
  return doc;
}

export function loadSkillManifest(filePath) {
  if (!existsSync(filePath)) throw new Error(`skill manifest not found: ${filePath}`);
  return parseSkillManifestText(readFileSync(filePath, "utf8"));
}

export function validateAgenticSkillManifest(skill = {}) {
  const errors = [];
  if (skill.version !== AGENTIC_SKILL_MANIFEST_VERSION) errors.push(`version must be ${AGENTIC_SKILL_MANIFEST_VERSION}`);
  if (!skill.name) errors.push("name is required");
  if (!skill.description) errors.push("description is required");
  if (!skill.ruleoak) errors.push("ruleoak section is required");
  if (skill.ruleoak?.evidenceFormat !== "ruleoak.agentic.evidence.v1") errors.push("ruleoak.evidenceFormat must be ruleoak.agentic.evidence.v1");
  const manifest = skill.ruleoak?.manifest;
  if (!manifest) errors.push("ruleoak.manifest is required");
  if (manifest) {
    const validation = validateRuleOakManifest(manifest);
    if (!validation.ok) errors.push(...validation.errors.map((e) => `ruleoak.manifest: ${e}`));
  }
  return { ok: errors.length === 0, errors };
}

export function skillManifestToRuleOakManifest(skill = {}) {
  if (!skill.ruleoak?.manifest) throw new Error("skill has no ruleoak.manifest");
  return skill.ruleoak.manifest;
}

export function scoreAgenticSkill(skill = {}) {
  const manifest = skillManifestToRuleOakManifest(skill);
  return calculateAgentTrustScore({ manifest, tools: manifest.tools || [], replaySupported: true, hasApproval: Boolean(skill.ruleoak?.approvalRequired) });
}

export function renderSkillSummary(skill = {}) {
  const manifest = skillManifestToRuleOakManifest(skill);
  return [
    `# ${skill.name}`,
    "",
    skill.description || "",
    "",
    "## RuleOak manifest summary",
    "",
    generateRuleOakManifestSummary(manifest),
    ""
  ].join("\n");
}

export function createSkillTemplate({ name = "my-ruleoak-skill", description = "A governed RuleOak skill." } = {}) {
  return {
    version: AGENTIC_SKILL_MANIFEST_VERSION,
    name,
    description,
    ruleoak: {
      evidenceFormat: "ruleoak.agentic.evidence.v1",
      approvalRequired: true,
      manifest: {
        version: "ruleoak.manifest.v1",
        project: { name },
        agent: { name, runtime: "skill" },
        permissions: {
          allowedActions: ["search.read"],
          approvalRequired: ["email.send"],
          blockedActions: ["filesystem.delete", "shell.execute"]
        },
        evidence: { enabled: true, format: "jsonl", replayable: true },
        redaction: { enabled: true }
      }
    }
  };
}
