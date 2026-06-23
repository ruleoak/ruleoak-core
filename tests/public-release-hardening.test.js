import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const report = JSON.parse(execFileSync("node", ["scripts/public-release-hardening-check.js"], { encoding: "utf8" }));
assert.equal(report.ok, true);
assert.equal(report.latestPublicCoreRelease, "v2.2.0");
assert.equal(report.packageVersion, "2.2.0");
console.log("public-release-hardening.test.js passed");
