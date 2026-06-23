import { existsSync, readFileSync } from "node:fs";
import { hardenMcpCatalog } from "./mcp-hardening.js";

export function scanLocalMcpRegistry(filePath) {
  if (!existsSync(filePath)) throw new Error(`MCP registry file not found: ${filePath}`);
  const catalog = JSON.parse(readFileSync(filePath, "utf8"));
  return hardenMcpCatalog(catalog);
}

export function renderMcpHardeningMarkdown(result) {
  const rows = result.scan.tools.map((t) => `| ${t.name} | ${t.riskLevel} | ${t.reason || "classified"} |`).join("\n");
  return [`# MCP hardening report`, "", "| Tool | Risk | Reason |", "|---|---|---|", rows || "| none | low | no tools |", ""].join("\n");
}
