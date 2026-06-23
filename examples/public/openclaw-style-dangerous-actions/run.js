#!/usr/bin/env node
import { evaluateOpenClawAction } from "../../../packages/ruleoak-openclaw-adapter/src/index.js";
const story = [
  { label: "safe read", action: { kind: "filesystem.read", path: "README.md" } },
  { label: "delete user file", action: { kind: "filesystem.delete", path: "../user-data.db" } },
  { label: "database drop", action: { kind: "database.mutate", sql: "DROP TABLE customers" } },
  { label: "send email", action: { kind: "email.send", target: "customer@example.com" } }
];
for (const step of story) {
  const res = evaluateOpenClawAction(step.action);
  console.log(`${step.label}: ${res.decision.decision} — ${res.decision.reason}`);
}
