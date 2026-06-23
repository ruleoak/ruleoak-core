import { evaluateFilesystemAction } from "../../../src/agentic/index.js";
const workspaceRoot = process.cwd();
const safeEdit = evaluateFilesystemAction({ operation: "write", path: `${workspaceRoot}/src/example.js` }, { workspaceRoot });
const secretRead = evaluateFilesystemAction({ operation: "read", path: `${workspaceRoot}/.env` }, { workspaceRoot });
console.log(JSON.stringify({ safeEdit: safeEdit.decision, secretRead: secretRead.decision }, null, 2));
