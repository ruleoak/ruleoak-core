import { existsSync, readFileSync } from "node:fs";
const required = [
  "apps/safedesk/README.md",
  "apps/safedesk/examples/public-demo/run.js",
  "apps/home-evidence/README.md",
  "apps/travel-proof/README.md",
  "apps/creator-proof/README.md",
  "apps/freelancer-proof/README.md",
  "apps/personal-knowledge-proof/README.md",
  "packages/safedesk-evidence/src/index.js",
  "packages/safedesk-reports/src/index.js",
  "docs/consumer/privacy-and-local-first.md",
  "docs/website-copy/safedesk-page.md"
];
const banned = [/guarantee (?:visa|claim|outcome|copyright)/i, /legal advice provided/i, /insurance advice provided/i];
const failures = [];
for (const f of required) if (!existsSync(f)) failures.push(`missing ${f}`);
for (const f of required.filter(f => f.endsWith('.md'))) {
  if (!existsSync(f)) continue;
  const text = readFileSync(f, "utf8");
  for (const re of banned) if (re.test(text)) failures.push(`banned claim in ${f}: ${re}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Consumer release readiness passed");
