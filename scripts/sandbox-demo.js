#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SandboxManager } from "../src/sandbox/index.js";

const sandbox = new SandboxManager({ workspaceRoot: process.cwd() });
const checks = [
  ["filesystem read allowed", sandbox.canRead("examples/research-brief-demo/README.md")],
  ["filesystem read denied", sandbox.canRead(".env")],
  ["filesystem escape denied", sandbox.canRead("../../secret.txt")],
  ["filesystem write allowed", sandbox.canWrite("out/sandbox-demo-report.json")],
  ["network localhost allowed", sandbox.canConnect("http://127.0.0.1:11434/api/generate")],
  ["network external denied", sandbox.canConnect("https://example.com")],
  ["command node allowed", sandbox.canExecute(["node", "--version"])],
  ["command rm denied", sandbox.canExecute("rm -rf out")],
  ["command kubectl approval", sandbox.canExecute("kubectl get pods")],
  ["tool report.export allowed", sandbox.canUseTool("report.export")],
  ["tool service.restart approval", sandbox.canUseTool("service.restart")],
  ["tool shell.exec denied", sandbox.canUseTool("shell.exec")]
];

console.log("RuleOak Sandbox Foundation Demo");
console.log("--------------------------------");
for (const [label, decision] of checks) {
  console.log(`${label.padEnd(32)} -> ${decision.decision} (${decision.reason})`);
}

const report = {
  generatedAt: new Date().toISOString(),
  stage: "security foundation",
  boundary: "deny-by-default sandbox foundation; not externally security-reviewed",
  checks: checks.map(([label, decision]) => ({ label, ...decision }))
};
mkdirSync("out", { recursive: true });
const outPath = join("out", "sandbox-demo-report.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log("");
console.log(`Output written to ${outPath}`);
