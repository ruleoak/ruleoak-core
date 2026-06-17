#!/usr/bin/env node
import assert from "node:assert/strict";
import { NetworkGuard } from "../src/sandbox/index.js";

const guard = new NetworkGuard();
assert.equal(guard.evaluate("http://127.0.0.1:11434/api/generate").decision, "allow");
assert.equal(guard.evaluate("localhost:3000").decision, "allow");
assert.equal(guard.evaluate("https://example.com").decision, "deny");
assert.equal(guard.evaluate("api.openai.com").decision, "deny");
console.log("sandbox network test passed");
