#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const rawName = process.argv[2];

if (!rawName) {
  console.error("Usage: npm run create:app -- my-consultant-app");
  process.exit(1);
}

const safeName = rawName
  .toLowerCase()
  .replace(/[^a-z0-9-_]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!safeName) {
  console.error("Please provide a valid app name.");
  process.exit(1);
}

const repoRoot = resolve(".");
const source = join(repoRoot, "examples", "technical-consultant-demo");
const targetRoot = join(repoRoot, "apps");
const target = join(targetRoot, safeName);

if (!existsSync(source)) {
  console.error(`Missing template: ${source}`);
  process.exit(1);
}

if (existsSync(target)) {
  console.error(`Target already exists: ${target}`);
  process.exit(1);
}

mkdirSync(targetRoot, { recursive: true });
cpSync(source, target, { recursive: true });

console.log(`Created ${target}`);
console.log("");
console.log("Next:");
console.log(`  cd apps/${safeName}`);
console.log("  node run.js");
console.log("");
console.log("Then edit:");
console.log("  policy.json");
console.log("  mock-data/");
console.log("  run.js");
