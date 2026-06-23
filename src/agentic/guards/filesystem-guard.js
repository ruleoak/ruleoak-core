import { resolve, relative, normalize, sep, basename, dirname } from "node:path";
import { existsSync, realpathSync, lstatSync } from "node:fs";
import { redactValue } from "../redaction.js";

export const FILESYSTEM_GUARD_SCHEMA = "ruleoak.filesystem_guard.v1";

const DEFAULT_PROTECTED_SEGMENTS = new Set([
  ".ssh", ".gnupg", ".aws", ".azure", ".gcloud", ".env", ".npmrc", ".pypirc", ".git",
  "id_rsa", "id_ed25519", "cookies", "login data", "keychain", "password", "secrets",
  "secret", "credentials", "token", "tokens", "browser", "chrome", "firefox", "brave", "safari"
]);
const PROTECTED_FILE_RE = /(^|[\\/.])(?:\.env(?:\..*)?|id_rsa|id_ed25519|credentials(?:\.json)?|token(?:s)?(?:\.json)?|passwords?)(?:$|[\\/.])/i;
const WRITE_OPS = new Set(["write", "append", "edit", "create", "rename", "move", "delete", "remove", "unlink", "rmdir", "copy"]);
const DELETE_OPS = new Set(["delete", "remove", "unlink", "rmdir", "wipe", "rm", "trash"]);

function asArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function lower(value) { return String(value || "").toLowerCase(); }
function safeRealpath(path) {
  const resolved = resolve(String(path || "."));
  try {
    if (existsSync(resolved)) return realpathSync(resolved);

    // For a non-existing target inside an existing workspace, resolve the
    // nearest existing ancestor first. This avoids false outside-workspace
    // denials on platforms such as macOS where temporary directories can be
    // reached through symlinked path prefixes. Example: workspace root may
    // realpath to /private/var/... while a new child path still appears as
    // /var/... until it exists.
    const missingSegments = [];
    let cursor = resolved;
    while (!existsSync(cursor)) {
      const parent = dirname(cursor);
      if (parent === cursor) break;
      missingSegments.unshift(basename(cursor));
      cursor = parent;
    }

    if (existsSync(cursor)) {
      return resolve(realpathSync(cursor), ...missingSegments);
    }

    return resolved;
  } catch {
    return resolved;
  }
}
function isSymlink(path) {
  try { return existsSync(path) && lstatSync(path).isSymbolicLink(); } catch { return false; }
}

export function isPathInside(childPath, parentPath) {
  const child = resolve(String(childPath || "."));
  const parent = resolve(String(parentPath || "."));
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !rel.startsWith(`..${sep}`) && rel !== "..");
}

export function classifyFilesystemAction(action = {}, options = {}) {
  const operation = lower(action.operation || action.action || action.verb || "read");
  const targetPath = String(action.path || action.target || action.filePath || action.input?.path || "");
  const cwd = resolve(String(options.cwd || process.cwd()));
  const normalizedPath = normalize(targetPath || ".");
  const resolvedPath = resolve(cwd, normalizedPath);
  const realResolvedPath = safeRealpath(resolvedPath);
  const lowerPath = resolvedPath.toLowerCase();
  const segments = resolvedPath.split(/[\\/]+/).map((s) => s.toLowerCase());
  const isWrite = WRITE_OPS.has(operation);
  const isDelete = DELETE_OPS.has(operation);
  const hasTraversal = String(targetPath).split(/[\\/]+/).includes("..");
  const protectedSegment = segments.find((s) => DEFAULT_PROTECTED_SEGMENTS.has(s));
  const protectedPattern = PROTECTED_FILE_RE.test(lowerPath) || DEFAULT_PROTECTED_SEGMENTS.has(basename(lowerPath));
  const symlink = isSymlink(resolvedPath);
  const workspaceRoots = asArray(options.workspaceRoots || options.workspaceRoot || process.cwd()).map((p) => safeRealpath(resolve(String(p))));
  const insideAllowedWorkspace = workspaceRoots.some((root) => isPathInside(realResolvedPath, root));
  const gitDirectory = segments.includes(".git");
  const protectedMatch = protectedSegment || (protectedPattern ? basename(lowerPath) : null) || (gitDirectory ? ".git" : null);
  const risk = protectedMatch || hasTraversal || symlink || isDelete ? "high" : isWrite ? "medium" : insideAllowedWorkspace ? "low" : "medium";
  return {
    operation,
    targetPath,
    normalizedPath,
    resolvedPath,
    realResolvedPath,
    isWrite,
    isDelete,
    hasTraversal,
    isSymlink: symlink,
    protectedMatch: protectedMatch || null,
    insideAllowedWorkspace,
    workspaceRoots,
    risk,
    dryRunRecommended: isWrite || isDelete || !insideAllowedWorkspace || Boolean(protectedMatch || hasTraversal || symlink)
  };
}

export function evaluateFilesystemAction(action = {}, policy = {}) {
  const classification = classifyFilesystemAction(action, policy);
  const protectedPath = Boolean(classification.protectedMatch || classification.hasTraversal || classification.isSymlink);
  let decision = "allow";
  let reason = "read-only file action allowed";
  if (protectedPath) { decision = "deny"; reason = "protected path, symlink, or traversal detected"; }
  else if (!classification.insideAllowedWorkspace) { decision = "deny"; reason = "path is outside allowed workspace roots"; }
  else if (classification.isDelete && policy.allowDelete !== true) { decision = "needs_approval"; reason = "delete requires approval by default"; }
  else if (classification.isWrite && policy.allowWrite !== true) { decision = "needs_approval"; reason = "write requires approval by default"; }
  const dryRun = policy.requireDryRun !== false && classification.dryRunRecommended;
  return {
    schemaVersion: FILESYSTEM_GUARD_SCHEMA,
    guard: "filesystem",
    decision,
    allowedNow: decision === "allow",
    approvalRequired: decision === "needs_approval",
    blocked: decision === "deny",
    reason,
    dryRunRequired: dryRun && decision !== "deny",
    classification,
    evidencePayload: redactValue({ action, classification, decision, reason, dryRunRequired: dryRun })
  };
}

export function filesystemDecisionToRuleOakAction(action = {}, policy = {}) {
  const decision = evaluateFilesystemAction(action, policy);
  return {
    toolName: "filesystem",
    operation: decision.classification.operation,
    target: decision.classification.resolvedPath,
    risk: decision.classification.risk,
    input: decision.evidencePayload,
    metadata: { guard: "filesystem", decision: decision.decision, reason: decision.reason, dryRunRequired: decision.dryRunRequired }
  };
}
