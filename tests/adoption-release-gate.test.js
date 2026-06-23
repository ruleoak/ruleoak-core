import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
const out = execFileSync(process.execPath, ["scripts/check-adoption-release-gate.js", "--json"], { encoding: "utf8" });
const result = JSON.parse(out);
assert.equal(result.ok, true, result.failures.join("\n"));
assert.equal(result.failures.length, 0);
console.log("adoption-release-gate.test.js passed");
