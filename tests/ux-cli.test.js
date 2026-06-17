#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const root = resolve(".");
function run(args) {
  const result = spawnSync("node", ["src/cli/roak.js", ...args], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

run(["demo"]);
assert.equal(existsSync(join(root, "reports", "html", "index.html")), true, "report viewer index should exist");
assert.equal(existsSync(join(root, "reports", "html", "technical-consultant-report.html")), true, "consultant HTML report should exist");
assert.equal(existsSync(join(root, "reports", "html", "research-brief-report.html")), true, "research HTML report should exist");

const tmp = join(root, "tmp-ruleoak-ux-template-test");
if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
run(["init", "tmp-ruleoak-ux-template-test", "--template=research-workflow"]);
assert.equal(existsSync(join(tmp, "README.md")), true, "template README should be copied");
assert.equal(existsSync(join(tmp, "policy.json")), true, "template policy should be copied");
rmSync(tmp, { recursive: true, force: true });

console.log("ux-cli test passed");
