import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
assert.equal(existsSync("packages/ruleoak-agentic-skills/package.json"), true);
assert.match(readFileSync("packages/ruleoak-agentic-skills/package.json", "utf8"), /"version": "1\.0\.0"/);
assert.equal(existsSync("packages/ruleoak-agentic-skills/skills/ruleoak-agent-firewall-demo/skill.yaml"), true);
execFileSync("node", ["tests/agentic-skills.test.js"], { stdio: "pipe", cwd: "packages/ruleoak-agentic-skills" });
console.log("agentic skills v1.0.0 package tests passed");
