#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdirSync, symlinkSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { FilesystemGuard } from "../src/sandbox/index.js";

const root = resolve(".");
const guard = new FilesystemGuard({ workspaceRoot: root });

assert.equal(guard.canRead("examples/research-brief-demo/README.md").decision, "allow");
assert.equal(guard.canWrite("examples/research-brief-demo/out/report.json").decision, "allow");
assert.equal(guard.canRead(".env").decision, "deny");
assert.equal(guard.canRead("../../secret.txt").decision, "deny");
assert.equal(guard.canRead("~/.ssh/id_rsa").decision, "deny");
assert.equal(guard.canRead("docs/private-token.txt").decision, "deny");

const outsideDir = resolve(root, "..", "ruleoak-sandbox-outside-test");
const linkPath = join(root, "examples", "research-brief-demo", "mock-data", "escape-link");
try {
  rmSync(outsideDir, { recursive: true, force: true });
  mkdirSync(outsideDir, { recursive: true });
  writeFileSync(join(outsideDir, "secret.txt"), "secret");
  rmSync(linkPath, { recursive: true, force: true });
  symlinkSync(outsideDir, linkPath, "dir");
  assert.equal(guard.canRead("examples/research-brief-demo/mock-data/escape-link/secret.txt").decision, "deny");
} finally {
  rmSync(linkPath, { recursive: true, force: true });
  rmSync(outsideDir, { recursive: true, force: true });
}

console.log("sandbox filesystem test passed");
