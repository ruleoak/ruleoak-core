import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createDemoCase } from "../../../apps/creator-proof/src/index.js";
import { renderCaseReportMarkdown } from "../../../packages/safedesk-reports/src/index.js";

const outDir = join(process.cwd(), "examples/consumer-vertical-demos/creator-proof/out");
mkdirSync(outDir, { recursive: true });
const demoCase = createDemoCase();
const report = renderCaseReportMarkdown(demoCase);
writeFileSync(join(outDir, "creator-proof-report.md"), report);
console.log("SafeDesk Creator Proof public demo");
console.log(`case=${demoCase.caseId} evidence=${demoCase.evidenceItems.length} report=out/creator-proof-report.md`);
