import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createDemoCase } from "../../../apps/home-evidence/src/index.js";
import { renderCaseReportMarkdown } from "../../../packages/safedesk-reports/src/index.js";

const outDir = join(process.cwd(), "examples/consumer-vertical-demos/home-evidence/out");
mkdirSync(outDir, { recursive: true });
const demoCase = createDemoCase();
const report = renderCaseReportMarkdown(demoCase);
writeFileSync(join(outDir, "home-evidence-report.md"), report);
console.log("SafeDesk Home Evidence public demo");
console.log(`case=${demoCase.caseId} evidence=${demoCase.evidenceItems.length} report=out/home-evidence-report.md`);
