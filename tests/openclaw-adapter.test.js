import { strict as assert } from "node:assert";
import { evaluateOpenClawAction, normalizeOpenClawAction } from "../packages/ruleoak-openclaw-adapter/src/index.js";
assert.equal(normalizeOpenClawAction({ kind: "email.send" }).toolName, "email");
assert.equal(evaluateOpenClawAction({ kind: "filesystem.delete", path: "../user.db" }).decision.decision, "deny");
assert.equal(evaluateOpenClawAction({ kind: "email.send", target: "a@example.com" }).decision.decision, "needs_approval");
assert.equal(evaluateOpenClawAction({ kind: "filesystem.read", path: "README.md" }).decision.decision, "allow");
console.log("openclaw-adapter.test.js passed");
