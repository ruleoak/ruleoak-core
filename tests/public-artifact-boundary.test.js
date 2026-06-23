import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["scripts/check-public-artifact-boundary.js"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status);
console.log("public artifact boundary test passed");
