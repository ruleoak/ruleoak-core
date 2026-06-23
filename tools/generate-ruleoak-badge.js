#!/usr/bin/env node
const level = process.argv[2] || "evidence-compatible";
console.log(`![RuleOak ${level}](https://img.shields.io/badge/RuleOak-${level.replaceAll('-', '--')}-blue)`);
