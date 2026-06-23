import { loadSkillManifest, renderSkillSummary, scoreAgenticSkill, validateAgenticSkillManifest } from "../src/index.js";
const skill = loadSkillManifest("skills/ruleoak-agent-firewall-demo/skill.yaml");
const validation = validateAgenticSkillManifest(skill);
if (!validation.ok) throw new Error(validation.errors.join("; "));
console.log(renderSkillSummary(skill));
console.log(JSON.stringify(scoreAgenticSkill(skill), null, 2));
