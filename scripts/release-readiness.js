#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const checks = [
  { name: "package version is v2.2.0 public release", ok: pkg.version === "2.2.0" },
  { name: "README exists", ok: existsSync("README.md") },
  { name: "agentic public demo exists", ok: existsSync("examples/public-agentic-demo/run.js") },
  { name: "release checklist exists", ok: existsSync("RELEASE-CHECKLIST-v2.2.0.md") }
];
const report = { ok: checks.every((c) => c.ok), latestPublicCoreRelease: "v2.2.0", checks };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
