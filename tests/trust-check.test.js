import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const summary = JSON.parse(execFileSync("node", ["scripts/trust-check.js"], { encoding: "utf8" }));
assert.equal(summary.latest_public_core_release, "v2.2.0");
console.log("trust-check.test.js passed");
