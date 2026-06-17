#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const model = process.env.RULEOAK_OLLAMA_MODEL || "qwen3:4b";
function readJson(name) { return JSON.parse(readFileSync(join(here, "mock-data", name), "utf8")); }
function readText(name) { return readFileSync(join(here, "mock-data", name), "utf8"); }
const alert = readJson("alert.json"); const logs = readJson("logs.json"); const metrics = readJson("metrics.json"); const policy = readJson("policy.json"); const notes = readText("notes.md");
const prompt = `You are a technical consultant using the RuleOak pattern: policy, evidence, approval, audit.\n\nCreate a concise case report.\n\nYou must include:\n1. case summary\n2. key evidence\n3. probable cause\n4. recommended next action\n5. whether the action should require human approval\n\nPolicy:\n${JSON.stringify(policy, null, 2)}\n\nAlert:\n${JSON.stringify(alert, null, 2)}\n\nMetrics:\n${JSON.stringify(metrics, null, 2)}\n\nLogs:\n${JSON.stringify(logs, null, 2)}\n\nNotes:\n${notes}\n`;
async function main() {
  console.log("RuleOak Technical Consultant Demo with Local LLM"); console.log("------------------------------------------------"); console.log(`Model: ${model}\n`);
  const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model, stream: false, prompt }) }).catch((err) => { throw new Error(`Cannot reach Ollama at 127.0.0.1:11434. Is Ollama running? ${err.message}`); });
  if (!response.ok) { const text = await response.text(); throw new Error(`Ollama request failed: ${response.status} ${text}`); }
  const data = await response.json(); const report = { generated_at: new Date().toISOString(), model, mode: "local-ollama", case_id: alert.case_id, llm_report: data.response?.trim() || "", ruleoak_boundary: { pattern: ["policy", "evidence", "approval", "audit"], note: "This demo drafts a report only. It does not execute remediation." } };
  const outDir = join(here, "out"); mkdirSync(outDir, { recursive: true }); const outPath = join(outDir, "case-report-local-llm.json"); writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(report.llm_report); console.log(`\nOutput written to ${outPath}`);
}
main().catch((err) => { console.error(err.message); console.error("\nTry:\n  npm run llm:doctor\n  npm run llm:pull\n  RULEOAK_OLLAMA_MODEL=qwen3:4b npm run example:consultant:llm"); process.exit(1); });
