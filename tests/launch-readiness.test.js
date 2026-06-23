import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const report = JSON.parse(execFileSync("node", ["scripts/launch-readiness-check.js"], { encoding: "utf8" }));
assert.equal(report.ok, true);
assert.equal(report.latestPublicCoreRelease, "v2.2.0");
console.log("launch-readiness.test.js passed");
