import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["scripts/check-no-private-product-leak.js"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status);
console.log("no private product leak test passed");
