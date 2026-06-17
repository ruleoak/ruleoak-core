#!/usr/bin/env node
import assert from "node:assert/strict";
import { ToolRegistry } from "../src/sandbox/index.js";

const registry = new ToolRegistry();
assert.equal(registry.evaluate("logs.read").decision, "allow");
assert.equal(registry.evaluate("metrics.read").decision, "allow");
assert.equal(registry.evaluate("report.export").decision, "allow");
assert.equal(registry.evaluate("service.restart").decision, "approval_required");
assert.equal(registry.evaluate("email.send").decision, "approval_required");
assert.equal(registry.evaluate("shell.exec").decision, "deny");
assert.equal(registry.evaluate("unknown.tool").decision, "approval_required");
console.log("sandbox tool-policy test passed");
