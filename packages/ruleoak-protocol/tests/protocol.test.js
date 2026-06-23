import { strict as assert } from "node:assert";
import { RULEOAK_EVIDENCE_SCHEMA_VERSION, isRuleOakEvidenceEvent } from "../src/index.js";
assert.equal(RULEOAK_EVIDENCE_SCHEMA_VERSION, "ruleoak.agentic.evidence.v1");
assert.equal(isRuleOakEvidenceEvent({ schemaVersion: RULEOAK_EVIDENCE_SCHEMA_VERSION, eventId: "e", runId: "r", type: "run_started" }), true);
console.log("protocol.test.js passed");
