#!/usr/bin/env node
import assert from "node:assert/strict";
import { CommandGuard } from "../src/sandbox/index.js";

const guard = new CommandGuard();
assert.equal(guard.evaluate(["node", "--version"]).decision, "allow");
assert.equal(guard.evaluate("cat docs/README.md").decision, "allow");
assert.equal(guard.evaluate("rm -rf out").decision, "deny");
assert.equal(guard.evaluate("curl https://example.com").decision, "deny");
assert.equal(guard.evaluate("node script.js; rm -rf out").decision, "deny");
assert.equal(guard.evaluate("kubectl get pods").decision, "approval_required");
assert.equal(guard.evaluate("python script.py").decision, "deny");
console.log("sandbox command test passed");
