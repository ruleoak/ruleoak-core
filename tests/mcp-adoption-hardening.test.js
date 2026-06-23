import { strict as assert } from "node:assert";
import { hardenMcpCatalog } from "../src/agentic/mcp/mcp-hardening.js";
const result = hardenMcpCatalog({ name: "demo", tools: [{ name: "search", description: "read-only search tool", inputSchema: {} }, { name: "shell_exec", description: "execute shell command", inputSchema: {} }] });
assert.ok(result.recommendedManifest.permissions.blockedActions.includes("shell_exec"));
assert.ok(result.schemaLint.length === 2);
console.log("mcp-adoption-hardening.test.js passed");
