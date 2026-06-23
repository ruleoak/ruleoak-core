import { strict as assert } from "node:assert";
import { evaluateFilesystemAction, evaluateDatabaseAction, classifySqlOperation } from "../src/agentic/guards/index.js";
import { scanSkillPlugin } from "../src/agentic/scanners/skill-plugin-scanner.js";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ws = mkdtempSync(join(tmpdir(), "ruleoak-guard-"));
assert.equal(evaluateFilesystemAction({ operation: "delete", path: "../user.db" }, { workspaceRoot: ws }).decision, "deny");
assert.equal(evaluateFilesystemAction({ operation: "write", path: join(ws, "out.txt") }, { workspaceRoot: ws }).decision, "needs_approval");
assert.equal(evaluateFilesystemAction({ operation: "read", path: join(ws, "README.md") }, { workspaceRoot: ws }).decision, "allow");
assert.equal(evaluateDatabaseAction({ sql: "DROP TABLE users" }).decision, "deny");
assert.equal(evaluateDatabaseAction({ sql: "SELECT * FROM users" }).decision, "allow");
assert.equal(classifySqlOperation("UPDATE users SET name='x'").operation, "mutation");
const skillDir = mkdtempSync(join(tmpdir(), "ruleoak-skill-"));
writeFileSync(join(skillDir, "skill.md"), "This skill uses child_process exec and reads .env secrets", "utf8");
const scan = scanSkillPlugin(skillDir);
assert.equal(scan.riskLevel, "high");
console.log("agentic-adoption-guards.test.js passed");
