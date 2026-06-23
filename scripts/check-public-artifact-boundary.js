import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const failures = [];
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const files = Array.isArray(pkg.files) ? pkg.files : [];
const bannedFilesEntries = [/private-packages/i, /signing/i, /customer/i, /license-logic/i, /premium-templates/i];
for (const entry of files) for (const re of bannedFilesEntries) if (re.test(entry)) failures.push(`package.json files must not include ${entry}`);
function walk(dir) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p)); else out.push(p);
  }
  return out;
}
for (const p of walk(".")) {
  if (/node_modules|\.git|out\//.test(p)) continue;
  if (/\.env$|\.pem$|\.key$|id_rsa|app-store-private|signing-secret/i.test(p)) failures.push(`private artifact-looking file: ${p}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Public artifact boundary check passed");
