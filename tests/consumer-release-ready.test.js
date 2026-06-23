import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["scripts/check-consumer-release-ready.js"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status);
console.log("consumer release-ready test passed");
