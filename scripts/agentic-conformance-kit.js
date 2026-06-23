#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseRuleOakManifestText, validateEvidenceJsonlText, validateRuleOakManifest } from "../src/agentic/index.js";

const json = process.argv.includes("--json");
const checks = [];
function add(name, ok, details = {}) { checks.push({ name, ok, details }); }
const evidencePath = "fixtures/agentic/evidence/v1/valid-agentic-evidence.jsonl";
const manifestPath = "fixtures/agentic/manifest/v1/valid-ruleoak.yml";
const evidence = validateEvidenceJsonlText(readFileSync(evidencePath, "utf8"), { allowUnknownTypes: false });
add("Evidence JSONL v1 fixture", evidence.ok, { lineCount: evidence.lineCount, errors: evidence.errors });
const manifest = validateRuleOakManifest(parseRuleOakManifestText(readFileSync(manifestPath, "utf8")));
add(".ruleoak.yml v1 fixture", manifest.ok, { errors: manifest.errors, warnings: manifest.warnings });
const result = { ok: checks.every((c) => c.ok), version: "agentic-v1", checks };
if (json) console.log(JSON.stringify(result, null, 2));
else {
  console.log("RuleOak Agentic Conformance Kit v1");
  for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"} ${c.name}`);
}
if (!result.ok) process.exit(1);
