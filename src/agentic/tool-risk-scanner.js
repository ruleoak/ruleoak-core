import { existsSync, readFileSync, statSync } from "node:fs";
import { extname } from "node:path";
import { ToolRiskClassifier } from "../guard/risk-classifier.js";


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

const HIGH_PATTERNS = [/shell/i, /exec/i, /command/i, /delete/i, /remove/i, /wipe/i, /credential/i, /secret/i, /token/i, /payment/i, /spend/i, /deploy/i, /production/i, /file.*write/i, /filesystem/i];
const MEDIUM_PATTERNS = [/send/i, /email/i, /message/i, /post/i, /publish/i, /write/i, /update/i, /create/i, /upload/i, /network/i, /http/i];
const LOW_PATTERNS = [/read/i, /search/i, /list/i, /inspect/i, /summarize/i, /retrieve/i, /validate/i, /classify/i];

function loadObject(filePath) {
  const text = readFileSync(filePath, "utf8");
  const ext = extname(filePath).toLowerCase();
  if ([".yaml", ".yml"].includes(ext)) return parseSimpleYamlObject(text);
  if (ext === ".json") return JSON.parse(text);
  return { sourceText: text };
}

function candidateToolsFromObject(value = {}) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.tools)) return value.tools;
  if (Array.isArray(value.functions)) return value.functions;
  if (Array.isArray(value.actions)) return value.actions;
  if (Array.isArray(value.mcp?.tools)) return value.mcp.tools;
  return [];
}

export function classifyToolRisk(tool = {}, classifier = new ToolRiskClassifier()) {
  const name = tool.name || tool.id || tool.toolName || tool.function?.name || "unknown_tool";
  const description = tool.description || tool.summary || tool.function?.description || "";
  const text = [name, description, tool.kind, tool.type, tool.operation, JSON.stringify(tool.inputSchema || tool.input_schema || tool.parameters || {})].filter(Boolean).join(" ");
  let category = "unknown";
  if (HIGH_PATTERNS.some((p) => p.test(text))) category = "high";
  else if (MEDIUM_PATTERNS.some((p) => p.test(text))) category = "medium";
  else if (LOW_PATTERNS.some((p) => p.test(text))) category = "low";
  else category = classifier.classify({ id: name, name, description, kind: tool.kind || tool.type || "tool", risk: tool.risk || "auto" }, { action: tool.operation || name, subject: description });

  const controls = category === "high"
    ? ["deny-by-default", "require-approval", "record-evidence", "dry-run-first"]
    : category === "medium" || category === "unknown"
      ? ["require-approval-or-explicit-allow", "record-evidence", "redact-payloads"]
      : ["record-evidence"];
  return { name, description, category, risk: category, controls, inputSchemaPresent: Boolean(tool.inputSchema || tool.input_schema || tool.parameters), tool };
}

export class ToolRiskScanner {
  constructor({ classifier = new ToolRiskClassifier() } = {}) {
    this.classifier = classifier;
  }

  scanTools(tools = []) {
    const results = tools.map((tool) => classifyToolRisk(tool, this.classifier));
    return this.reportFromResults(results);
  }

  scanObject(value = {}) {
    return this.scanTools(candidateToolsFromObject(value));
  }

  scanFile(filePath) {
    if (!existsSync(filePath)) throw new Error(`tool manifest not found: ${filePath}`);
    if (statSync(filePath).isDirectory()) throw new Error(`scanFile expects a file, got directory: ${filePath}`);
    const value = loadObject(filePath);
    return { ...this.scanObject(value), source: filePath };
  }

  reportFromResults(results = []) {
    const counts = { total: results.length, low: 0, medium: 0, high: 0, unknown: 0 };
    for (const result of results) counts[result.risk] = (counts[result.risk] || 0) + 1;
    const risky = results.filter((r) => r.risk === "high" || r.risk === "unknown");
    return {
      schemaVersion: "ruleoak.tool_risk_scan.v1",
      counts,
      ok: risky.length === 0,
      results,
      recommendations: risky.map((r) => `${r.name}: ${r.controls.join(", ")}`)
    };
  }

  renderMarkdown(report = {}) {
    const lines = ["# RuleOak Tool Risk Scan", "", `Tools: ${report.counts?.total ?? 0}`, "", "| Tool | Risk | Controls | Schema |", "|---|---|---|---|"];
    for (const result of report.results || []) {
      lines.push(`| ${result.name} | ${result.risk} | ${result.controls.join(", ")} | ${result.inputSchemaPresent ? "yes" : "no"} |`);
    }
    return lines.join("\n");
  }
}

export function scanToolRisks(tools = [], options = {}) {
  return new ToolRiskScanner(options).scanTools(tools);
}
