#!/usr/bin/env node
import { evaluateFilesystemAction, evaluateDatabaseAction } from "../../../src/agentic/guards/index.js";
console.log("file-delete", evaluateFilesystemAction({ operation: "delete", path: "../Documents/user.db" }, { workspaceRoot: process.cwd() }).decision);
console.log("db-drop", evaluateDatabaseAction({ sql: "DROP TABLE users" }).decision);
console.log("db-select", evaluateDatabaseAction({ sql: "SELECT * FROM users" }).decision);
