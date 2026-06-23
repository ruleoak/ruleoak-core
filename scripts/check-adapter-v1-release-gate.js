import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const failures = [];
function requireFile(path) { if (!existsSync(join(root, path))) failures.push(`missing ${path}`); }
function requirePkgVersion(path, version) {
  try { const pkg = JSON.parse(readFileSync(join(root, path), "utf8")); if (pkg.version !== version) failures.push(`${path} version expected ${version}, got ${pkg.version}`); }
  catch (err) { failures.push(`cannot read ${path}: ${err.message}`); }
}
function scanDisallowed(path) {
  if (!existsSync(join(root, path))) return;
  const text = readFileSync(join(root, path), "utf8").toLowerCase();
  for (const phrase of ["official openclaw integration", "openclaw certified", "openclaw endorsed", "partner integration"]) {
    if (text.includes(phrase)) failures.push(`${path} contains disallowed claim: ${phrase}`);
  }
}
requirePkgVersion("package.json", "2.2.0");
requirePkgVersion("packages/ruleoak-openclaw-adapter/package.json", "1.0.0");
requirePkgVersion("packages/ruleoak-protocol/package.json", "1.0.0");
requirePkgVersion("packages/ruleoak-adapters-ts/package.json", "1.0.0");
[
  "docs/adoption/v1-adapter-maturity-plan.md",
  "docs/adoption/adapter-support-matrix.md",
  "schemas/agentic/ruleoak-policy-v1.schema.json",
  "src/agentic/context/context-guard.js",
  "examples/context-engineering-guard/run.js",
  "harnesses/ruleoak-agent-safety-harness/run.js",
  "docs/adapters/openclaw-style.md",
  "docs/adapters/typescript.md",
  "docs/adapters/python.md",
  "docs/adapters/mcp.md",
  "docs/adapters/context-engineering.md",
  "docs/adoption/official-integration-boundary.md",
  "RELEASE-NOTES-adapters-v1.0.0.md"
].forEach(requireFile);
[
  "docs/adapters/openclaw-style.md",
  "packages/ruleoak-openclaw-adapter/README.md",
  "docs/adoption/openclaw-upstream-pr-ready/PR_DESCRIPTION_OPTIONAL_ADAPTER.md"
].forEach(scanDisallowed);
const result = { ok: failures.length === 0, failures };
if (process.argv.includes("--json")) console.log(JSON.stringify(result));
else { console.log(result.ok ? "adapter v1 release gate passed" : failures.join("\n")); }
if (!result.ok) process.exit(1);
