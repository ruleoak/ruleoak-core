import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createDemoCase } from "../../../apps/travel-proof/src/index.js";
import { renderCaseReportMarkdown } from "../../../packages/safedesk-reports/src/index.js";

const outDir = join(process.cwd(), "examples/consumer-vertical-demos/travel-proof/out");
mkdirSync(outDir, { recursive: true });
const demoCase = createDemoCase();
const report = renderCaseReportMarkdown(demoCase);
writeFileSync(join(outDir, "travel-proof-report.md"), report);
console.log("SafeDesk Travel Proof public demo");
console.log(`case=${demoCase.caseId} evidence=${demoCase.evidenceItems.length} report=out/travel-proof-report.md`);
