#!/usr/bin/env node
import { hardenMcpCatalog } from "../../src/agentic/mcp/mcp-hardening.js";
const result = hardenMcpCatalog({ name: "demo", tools: [ { name: "search", description: "read-only search", inputSchema: {} }, { name: "shell_exec", description: "execute shell command", inputSchema: {} } ] });
console.log(JSON.stringify(result.recommendedManifest.permissions, null, 2));
