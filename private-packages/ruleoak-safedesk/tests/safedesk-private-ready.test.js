import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["scripts/check-safedesk-private-ready.js"], { cwd: new URL("..", import.meta.url).pathname, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status);
console.log("private SafeDesk readiness test passed");
