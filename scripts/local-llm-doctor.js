#!/usr/bin/env node
import { buildRecommendation, printRecommendation } from "./local-llm-utils.js";
const rec = buildRecommendation(); printRecommendation(rec);
if (!rec.ollama.ok) { console.log("\nOllama is not installed or not on PATH. Install it first, then rerun: npm run llm:doctor"); }
