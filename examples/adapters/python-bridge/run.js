import { readFileSync } from "node:fs";
import { validateEvidenceJsonlText } from "../../../src/agentic/index.js";
const fixture = readFileSync("fixtures/agentic/evidence/v1/valid-agentic-evidence.jsonl", "utf8");
const result = validateEvidenceJsonlText(fixture);
console.log(JSON.stringify({ ok: result.ok, lineCount: result.lineCount, bridge: "python-compatible" }, null, 2));
