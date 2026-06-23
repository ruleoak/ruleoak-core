import { strict as assert } from "node:assert";
import { RULEOAK_POLICY_SCHEMA_VERSION, validateRuleOakPolicy, RULEOAK_BADGES, normalizeAdapterEnvelope } from "../src/index.js";
assert.equal(RULEOAK_POLICY_SCHEMA_VERSION, "ruleoak.policy.v1");
assert.equal(validateRuleOakPolicy({ schemaVersion: "ruleoak.policy.v1", defaultAction: "approval" }).ok, true);
assert.ok(RULEOAK_BADGES.evidenceCompatible.includes("RuleOak"));
assert.equal(normalizeAdapterEnvelope({ tool: "shell", action: "run" }).toolName, "shell");
console.log("protocol-v1.test.js passed");
