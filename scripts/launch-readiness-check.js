#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");
const checks = [];
function check(ok, name) { checks.push({ name, ok }); }
check(pkg.version === "2.2.0", "package version is 2.2.0");
check(readme.includes("Latest public release: **v2.2.0**"), "README states v2.2.0 as latest public release");
check(readme.includes("RuleOak Core v2.2.0"), "README labels this package as RuleOak Core v2.2.0");
check(existsSync("docs/launch/github-release-v2.2.0.md"), "GitHub release copy exists");
const ok = checks.every((c) => c.ok);
const report = { ok, latestPublicCoreRelease: "v2.2.0", releaseStatus: "RuleOak Core v2.2.0 public release readiness", checks };
console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
