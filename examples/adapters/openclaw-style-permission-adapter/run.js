#!/usr/bin/env node
import { evaluateOpenClawAction } from "../../../packages/ruleoak-openclaw-adapter/src/index.js";
for (const action of [
  { kind: "filesystem.delete", path: "../user.db" },
  { kind: "database.mutate", sql: "DROP TABLE users" },
  { kind: "email.send", target: "person@example.com" },
  { kind: "filesystem.read", path: "README.md" }
]) {
  const result = evaluateOpenClawAction(action);
  console.log(action.kind, result.decision.decision, result.decision.reason);
}
