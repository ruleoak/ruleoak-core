#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const model = process.env.RULEOAK_OLLAMA_MODEL || "qwen3:4b";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const policy = readJson(join(here, "policy.json"));
const question = readJson(join(here, "mock-data", "research-question.json"));
const sources = readJson(join(here, "mock-data", "sources.json"));
const notes = readFileSync(join(here, "mock-data", "notes.md"), "utf8");

const prompt = `You are preparing a short research brief using the RuleOak pattern: policy, evidence, approval, audit.

Task:
- Answer the research question.
- Extract 3 sourced claims.
- Separate facts from recommendation.
- Include known unknowns.
- State whether publication or external sending should require human approval.

Policy:
${JSON.stringify(policy, null, 2)}

Research question:
${JSON.stringify(question, null, 2)}

Sources:
${JSON.stringify(sources, null, 2)}

Notes:
${notes}
`;

async function main() {
  console.log("RuleOak Research Brief Demo with Local LLM");
  console.log("------------------------------------------");
  console.log(`Model: ${model}`);
  console.log("");

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, stream: false, prompt })
  }).catch((err) => {
    throw new Error(`Cannot reach Ollama at 127.0.0.1:11434. Is Ollama running? ${err.message}`);
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const report = {
    generated_at: new Date().toISOString(),
    model,
    mode: "local-ollama",
    demo: "research-brief-demo",
    llm_report: data.response?.trim() || "",
    boundary: "Synthetic demo only. Not production advice or compliance output."
  };

  const outDir = join(here, "out");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "research-brief-report-local-llm.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(report.llm_report);
  console.log("");
  console.log(`Output written to ${outPath}`);
}

main().catch((err) => {
  console.error(err.message);
  console.error("");
  console.error("Try:");
  console.error("  npm run llm:doctor");
  console.error("  npm run llm:pull");
  console.error("  RULEOAK_OLLAMA_MODEL=qwen3:4b npm run example:research:llm");
  process.exit(1);
});
