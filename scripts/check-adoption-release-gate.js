#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const required = [
  "packages/ruleoak-openclaw-adapter/src/index.js",
  "src/agentic/guards/filesystem-guard.js",
  "src/agentic/guards/database-guard.js",
  "docs/adoption/openclaw-upstream-pr/PR_DESCRIPTION.md",
  "docs/adoption/openclaw-security-disclosure-process.md",
  "docs/adoption/license-safe-integration-strategy.md",
  "packages/ruleoak-protocol/src/index.js",
  "packages/ruleoak-py/src/ruleoak_py/integrations/langgraph.py",
  "packages/ruleoak-adapters-ts/src/index.js",
  "examples/adapters/coding-agent-harness/run.js",
  "docs/integrations/mcp-hardening.md",
  "tools/generate-ruleoak-badge.js",
  "docs/launch/openclaw-style-demo-script.md"
];
const missing = required.filter((p) => !existsSync(p));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [...missing.map((p) => `missing ${p}`)];
if (pkg.version !== "2.2.0") failures.push(`core version must remain 2.2.0, found ${pkg.version}`);
const publicDocs = required.filter((p) => p.startsWith("docs/")).map((p) => readFileSync(p, "utf8")).join("\n").toLowerCase();
if (/exploit payload|bypass authentication|steal token/.test(publicDocs)) failures.push("public docs contain exploit-level phrases");
const result = { ok: failures.length === 0, checked: required.length, failures };
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else console.log(result.ok ? `Adoption release gate passed (${required.length} checks).` : `Adoption release gate failed:\n- ${failures.join("\n- ")}`);
if (!result.ok) process.exit(1);
