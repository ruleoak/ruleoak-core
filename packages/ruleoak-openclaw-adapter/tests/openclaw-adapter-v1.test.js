import { strict as assert } from "node:assert";
import { normalizeOpenClawAction, evaluateOpenClawAction, createOpenClawRuleOakMiddleware, OPENCLAW_STYLE_ADAPTER_VERSION } from "../src/index.js";
assert.equal(OPENCLAW_STYLE_ADAPTER_VERSION, "1.0.0");
assert.equal(normalizeOpenClawAction({ kind: "filesystem.delete", path: "/tmp/x" }).toolName, "filesystem");
assert.ok(["deny", "needs_approval"].includes(evaluateOpenClawAction({ kind: "shell.run", command: "rm -rf /" }).decision.decision));
const mw = createOpenClawRuleOakMiddleware();
assert.equal(typeof mw, "function");
console.log("openclaw-adapter-v1.test.js passed");
