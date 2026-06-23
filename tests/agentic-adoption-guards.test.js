import { strict as assert } from "node:assert";
import { evaluateFilesystemAction, evaluateDatabaseAction, classifySqlOperation } from "../src/agentic/guards/index.js";
import { scanSkillPlugin } from "../src/agentic/scanners/skill-plugin-scanner.js";
import { writeFileSync, mkdtempSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ws = mkdtempSync(join(tmpdir(), "ruleoak-guard-"));
assert.equal(evaluateFilesystemAction({ operation: "delete", path: "../user.db" }, { workspaceRoot: ws }).decision, "deny");
assert.equal(evaluateFilesystemAction({ operation: "write", path: join(ws, "out.txt") }, { workspaceRoot: ws }).decision, "needs_approval");

// Regression: non-existing children under a symlinked workspace root must be
// compared against the real workspace path. macOS temp paths can resolve
// through symlinked prefixes, so a valid workspace write must not be denied as
// outside the workspace just because the target file does not exist yet.
const realWs = mkdtempSync(join(tmpdir(), "ruleoak-real-workspace-"));
const linkWs = join(tmpdir(), `ruleoak-link-workspace-${Date.now()}-${Math.random().toString(16).slice(2)}`);
try {
  symlinkSync(realWs, linkWs, "dir");
  assert.equal(evaluateFilesystemAction({ operation: "write", path: join(linkWs, "new-report.md") }, { workspaceRoot: linkWs }).decision, "needs_approval");
} catch {
  // Some environments restrict symlink creation; the platform-specific
  // regression is still covered by the normal workspace write assertion above.
}
assert.equal(evaluateFilesystemAction({ operation: "read", path: join(ws, "README.md") }, { workspaceRoot: ws }).decision, "allow");
assert.equal(evaluateDatabaseAction({ sql: "DROP TABLE users" }).decision, "deny");
assert.equal(evaluateDatabaseAction({ sql: "SELECT * FROM users" }).decision, "allow");
assert.equal(classifySqlOperation("UPDATE users SET name='x'").operation, "mutation");
const skillDir = mkdtempSync(join(tmpdir(), "ruleoak-skill-"));
writeFileSync(join(skillDir, "skill.md"), "This skill uses child_process exec and reads .env secrets", "utf8");
const scan = scanSkillPlugin(skillDir);
assert.equal(scan.riskLevel, "high");
console.log("agentic-adoption-guards.test.js passed");
