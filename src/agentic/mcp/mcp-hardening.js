import { scanMcpToolCatalog } from "../mcp-store-scanner.js";

export function lintMcpToolSchema(tool = {}) {
  const warnings = [];
  if (!tool.name) warnings.push("tool.name is required");
  if (!tool.description || String(tool.description).length < 12) warnings.push("tool.description is missing or too vague");
  if (!tool.inputSchema && !tool.parameters) warnings.push("tool input schema is missing");
  const text = `${tool.name || ""} ${tool.description || ""}`.toLowerCase();
  if (/shell|exec|delete|drop|secret|password|token|credential/.test(text)) warnings.push("tool appears high risk and should require approval");
  return { toolName: tool.name || "unknown", ok: warnings.length === 0, warnings };
}

export function hardenMcpCatalog(catalog = {}) {
  const scan = scanMcpToolCatalog(catalog);
  const schemaLint = (catalog.tools || []).map(lintMcpToolSchema);
  const recommendedManifest = {
    version: "ruleoak.manifest.v1",
    project: { name: catalog.name || "mcp-catalog" },
    agent: { name: "mcp-agent", runtime: "mcp" },
    permissions: {
      allowedActions: (scan.scan?.results || []).filter((t) => (t.risk || t.riskLevel) === "low").map((t) => t.name),
      approvalRequired: (scan.scan?.results || []).filter((t) => (t.risk || t.riskLevel) === "medium").map((t) => t.name),
      blockedActions: (scan.scan?.results || []).filter((t) => (t.risk || t.riskLevel) === "high").map((t) => t.name)
    },
    evidence: { enabled: true, format: "jsonl", replayable: true },
    redaction: { enabled: true }
  };
  return { scan, schemaLint, recommendedManifest };
}
