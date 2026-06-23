import assert from "node:assert/strict";
import { createSkillTemplate, loadSkillManifest, renderSkillSummary, scoreAgenticSkill, validateAgenticSkillManifest, AGENTIC_SKILL_MANIFEST_VERSION } from "../src/index.js";

const skill = loadSkillManifest("skills/ruleoak-agent-firewall-demo/skill.yaml");
assert.equal(AGENTIC_SKILL_MANIFEST_VERSION, "ruleoak.skill.v1");
assert.equal(validateAgenticSkillManifest(skill).ok, true);
assert(renderSkillSummary(skill).includes("RuleOak manifest summary"));
assert(scoreAgenticSkill(skill).score >= 60);
const template = createSkillTemplate({ name: "template-skill" });
assert.equal(validateAgenticSkillManifest(template).ok, true);
for (const name of ["ruleoak-sre-change-governance", "ruleoak-document-evidence-review", "ruleoak-local-file-assistant-safety"]) {
  const loaded = loadSkillManifest(`skills/${name}/skill.yaml`);
  assert.equal(validateAgenticSkillManifest(loaded).ok, true);
}
console.log("agentic skills v1.0.0 tests passed");
