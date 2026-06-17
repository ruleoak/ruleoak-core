#!/usr/bin/env node
import assert from "node:assert/strict";
import { SandboxManager } from "../src/sandbox/index.js";

const sandbox = new SandboxManager({ workspaceRoot: process.cwd() });
assert.equal(sandbox.canRead("examples/research-brief-demo/README.md").decision, "allow");
assert.equal(sandbox.canRead(".env").decision, "deny");
assert.equal(sandbox.canConnect("https://example.com").decision, "deny");
assert.equal(sandbox.canExecute("kubectl get pods").decision, "approval_required");
assert.equal(sandbox.canUseTool("service.restart").decision, "approval_required");
assert.equal(sandbox.inspect().stage, "security foundation");
console.log("sandbox smoke test passed");
