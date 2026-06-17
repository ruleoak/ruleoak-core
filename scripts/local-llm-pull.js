#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { buildRecommendation, printRecommendation } from "./local-llm-utils.js";
const rec = buildRecommendation(); const model = process.env.RULEOAK_OLLAMA_MODEL || rec.profile.recommended_model;
printRecommendation({ ...rec, profile: { ...rec.profile, recommended_model: model } });
if (!rec.ollama.ok) { console.error("\nCannot pull model because Ollama is not installed or not on PATH."); process.exit(1); }
console.log(`\nPulling ${model}...`); const result = spawnSync("ollama", ["pull", model], { stdio: "inherit" }); process.exit(result.status ?? 1);
