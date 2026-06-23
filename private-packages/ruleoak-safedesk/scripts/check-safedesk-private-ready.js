import { existsSync } from "node:fs";
const required = [
  "README.md",
  "PRODUCT.md",
  "RELEASE-READINESS-SAFEDESK-MVP.md",
  "docs/privacy.md",
  "src/index.js",
  "src/onboarding/README.md",
  "src/protected-folders/README.md",
  "src/approval-queue/README.md",
  "src/evidence-timeline/README.md",
  "src/report-export/README.md",
  "src/verticals/home-evidence/README.md",
  "src/verticals/creator-proof/README.md"
];
const failures = required.filter(f => !existsSync(f)).map(f => `missing ${f}`);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Private SafeDesk readiness passed");
