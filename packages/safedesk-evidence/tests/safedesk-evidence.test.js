import assert from "node:assert/strict";
import { createVerticalCase, addEvidenceItem, addTimelineEvent, buildEvidenceTimeline, toRuleOakEvidenceEvent } from "../src/index.js";

const c = createVerticalCase("home", { title: "Water leakage evidence" });
assert.equal(c.vertical, "home");
const ev = addEvidenceItem(c, { type: "photo", title: "Ceiling stain", summary: "Photo reference only" });
const tl = addTimelineEvent(c, { type: "management_reply", title: "Management replied", evidenceRefs: [ev.evidenceId] });
assert.equal(buildEvidenceTimeline(c).length >= 2, true);
const ro = toRuleOakEvidenceEvent(c, tl);
assert.equal(ro.schema_version, "ruleoak.agentic.evidence.v1");
console.log("safedesk-evidence tests passed");
