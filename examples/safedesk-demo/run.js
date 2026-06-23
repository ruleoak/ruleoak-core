import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["apps/safedesk/examples/public-demo/run.js"], { stdio: "inherit" });
process.exit(result.status || 0);
