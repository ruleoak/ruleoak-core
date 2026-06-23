import { ToolRiskScanner } from "./tool-risk-scanner.js";

function toolsFromCatalog(catalog = {}) {
  if (Array.isArray(catalog)) return catalog;
  const servers = Array.isArray(catalog.servers) ? catalog.servers : [];
  const tools = [];
  for (const server of servers) {
    for (const tool of server.tools || []) tools.push({ ...tool, server: server.name || server.id || "unknown-server" });
  }
  return tools.length ? tools : (catalog.tools || []);
}

export function scanMcpToolCatalog(catalog = {}) {
  const scanner = new ToolRiskScanner();
  const scan = scanner.scanTools(toolsFromCatalog(catalog));
  const findings = [];
  for (const result of scan.results) {
    if (!result.description || result.description.length < 12) findings.push({ severity: "warning", tool: result.name, message: "tool description is vague or missing" });
    if (!result.inputSchemaPresent) findings.push({ severity: "warning", tool: result.name, message: "input schema missing" });
    if (result.risk === "high") findings.push({ severity: "error", tool: result.name, message: "high-risk MCP tool requires RuleOak policy before use" });
  }
  return { schemaVersion: "ruleoak.mcp_catalog_scan.v1", ok: !findings.some((f) => f.severity === "error"), scan, findings };
}

export function renderMcpCatalogScanMarkdown(report = {}) {
  const lines = ["# RuleOak MCP Catalog Scan", "", `Result: ${report.ok ? "PASS" : "REVIEW REQUIRED"}`, "", "## Findings", ""];
  if (!report.findings?.length) lines.push("No findings.");
  for (const f of report.findings || []) lines.push(`- ${f.severity.toUpperCase()} ${f.tool}: ${f.message}`);
  return lines.join("\n");
}
