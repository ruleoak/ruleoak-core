#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
const checks = [
  ["README.md", "Latest public release: **v2.2.0**"],
  ["README.md", "Agent Firewall + Flight Recorder"],
  ["docs/README.md", "v2.2.0"]
];
for (const [file, needle] of checks) {
  if (!existsSync(file) || !readFileSync(file, "utf8").includes(needle)) {
    throw new Error(`${file} must include ${needle}`);
  }
}
console.log(JSON.stringify({ ok: true, latest_public_core_release: "v2.2.0" }, null, 2));
