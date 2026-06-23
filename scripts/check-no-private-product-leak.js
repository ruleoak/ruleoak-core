import { readFileSync, existsSync } from "node:fs";
const failures = [];
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const files = Array.isArray(pkg.files) ? pkg.files : [];
for (const entry of files) {
  if (/private-packages/.test(entry)) failures.push(`package.json files includes private path: ${entry}`);
}
if (!existsSync("private-packages/README-DO-NOT-PUBLISH.md")) failures.push("missing private-packages/README-DO-NOT-PUBLISH.md");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Private product leak guard passed");
