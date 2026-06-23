import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createVerticalCase, addEvidenceItem } from "../packages/safedesk-evidence/src/index.js";
import { renderCaseReportMarkdown } from "../packages/safedesk-reports/src/index.js";
import { createSafeDeskApp } from "../apps/safedesk/src/main/create-app.js";
import { evaluateSafeDeskAction } from "../apps/safedesk/src/ruleoak/action-controller.js";
import { createDemoCase as createHomeDemo } from "../apps/home-evidence/src/index.js";
import { createDemoCase as createCreatorDemo } from "../apps/creator-proof/src/index.js";
import { createDemoCase as createTravelDemo } from "../apps/travel-proof/src/index.js";
import { createDemoCase as createFreelancerDemo } from "../apps/freelancer-proof/src/index.js";

const dataDir = mkdtempSync(join(tmpdir(), "ruleoak-safedesk-test-"));
const app = createSafeDeskApp({ dataDir });
assert.equal(app.screens.includes("approval-queue"), true);
const c = createVerticalCase("safedesk", { title: "AI action case" });
addEvidenceItem(c, { type: "action", title: "Mock AI action" });
assert.match(renderCaseReportMarkdown(c), /AI action/);
const denied = evaluateSafeDeskAction({ category: "secret.read", label: "Read secret" }, {});
assert.equal(denied.decision, "deny");
for (const demo of [createHomeDemo, createCreatorDemo, createTravelDemo, createFreelancerDemo]) {
  const dc = demo();
  assert.equal(dc.evidenceItems.length >= 1, true);
  assert.match(renderCaseReportMarkdown(dc), /Important limitation/);
}
console.log("SafeDesk consumer tests passed");
