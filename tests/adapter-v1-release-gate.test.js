import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
const result = JSON.parse(execFileSync(process.execPath, ["scripts/check-adapter-v1-release-gate.js", "--json"], { encoding: "utf8" }));
assert.equal(result.ok, true, result.failures.join("\n"));
console.log("adapter-v1-release-gate.test.js passed");
