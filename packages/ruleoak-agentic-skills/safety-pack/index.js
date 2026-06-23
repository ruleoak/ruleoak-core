import { scanSkillPlugin, renderSkillPluginScanMarkdown } from "../../../src/agentic/scanners/skill-plugin-scanner.js";
import { scoreAgenticSkill, validateAgenticSkillManifest } from "../src/index.js";

export function reviewSkillBeforeInstall({ manifest, path }) {
  const manifestValidation = manifest ? validateAgenticSkillManifest(manifest) : { ok: false, errors: ["manifest missing"] };
  const scan = path ? scanSkillPlugin(path) : null;
  const trust = manifestValidation.ok ? scoreAgenticSkill(manifest) : null;
  return { manifestValidation, scan, trust, recommendation: scan?.riskLevel === "high" ? "do_not_install_without_review" : "review_and_install_with_policy" };
}

export { scanSkillPlugin, renderSkillPluginScanMarkdown };
