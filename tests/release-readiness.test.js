import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const report = JSON.parse(execFileSync("node", ["scripts/release-readiness.js"], { encoding: "utf8" }));
assert.equal(report.ok, true);
assert.equal(report.latestPublicCoreRelease, "v2.2.0");
console.log("release-readiness.test.js passed");
