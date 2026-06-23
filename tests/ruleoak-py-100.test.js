import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
assert.equal(existsSync("packages/ruleoak-py/pyproject.toml"), true);
assert.match(readFileSync("packages/ruleoak-py/pyproject.toml", "utf8"), /version = "1\.0\.0"/);
const env = { ...process.env, PYTHONPATH: "packages/ruleoak-py/src" };
execFileSync("python3", ["packages/ruleoak-py/tests/test_ruleoak_py_100.py"], { stdio: "pipe", env });
execFileSync("python3", ["-m", "ruleoak_py.examples.quickstart"], { stdio: "pipe", env });
console.log("ruleoak-py v1.0.0 tests passed");
