import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const text = execFileSync("node", ["scripts/agentic-conformance-kit.js"], { encoding: "utf8" });
assert.match(text, /Conformance Kit v1/);
const json = JSON.parse(execFileSync("node", ["scripts/agentic-conformance-kit.js", "--json"], { encoding: "utf8" }));
assert.equal(json.ok, true);
assert.equal(json.checks.length >= 2, true);
console.log("agentic conformance kit tests passed");
