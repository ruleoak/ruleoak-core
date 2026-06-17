#!/usr/bin/env node
import { buildRecommendation } from "./local-llm-utils.js";
const rec = buildRecommendation(); const model = process.env.RULEOAK_OLLAMA_MODEL || rec.profile.recommended_model;
async function main() {
  console.log(`Testing Ollama model: ${model}`);
  const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model, stream: false, prompt: "In one sentence, explain what a governed AI runtime is." }) }).catch((err) => { throw new Error(`Cannot reach Ollama at 127.0.0.1:11434. Is Ollama running? ${err.message}`); });
  if (!response.ok) { const text = await response.text(); throw new Error(`Ollama request failed: ${response.status} ${text}`); }
  const data = await response.json(); console.log("\n" + (data.response?.trim() || "(empty response)"));
}
main().catch((err) => { console.error(err.message); console.error("\nTry:\n  npm run llm:doctor\n  npm run llm:pull"); process.exit(1); });
