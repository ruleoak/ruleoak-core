import { realpathSync, existsSync } from "node:fs";
import { relative, resolve, isAbsolute } from "node:path";
import { matchesAny } from "./pattern.js";
import { mergeSandboxPolicy, sandboxDecision } from "./sandbox-policy.js";

function normalizeForPolicy(path, workspaceRoot) {
  const raw = String(path || "");
  if (raw.startsWith("~/")) return { raw, deniedEarly: true, reason: "home directory access is denied" };

  const resolved = isAbsolute(raw) ? resolve(raw) : resolve(workspaceRoot, raw);
  let real = resolved;
  try {
    if (existsSync(resolved)) real = realpathSync(resolved);
  } catch {
    real = resolved;
  }

  const rel = relative(workspaceRoot, real).replace(/\\/g, "/");
  const outside = rel === "" ? false : rel.startsWith("..") || isAbsolute(rel);
  return { raw, resolved, real, rel: rel || ".", outside };
}

export class FilesystemGuard {
  constructor({ policy = {}, workspaceRoot = process.cwd() } = {}) {
    this.policy = mergeSandboxPolicy(policy);
    this.workspaceRoot = realpathSync(resolve(workspaceRoot));
  }

  evaluate(operation, targetPath) {
    const norm = normalizeForPolicy(targetPath, this.workspaceRoot);
    if (norm.deniedEarly) {
      return sandboxDecision({ subject: "filesystem", operation, decision: "deny", reason: norm.reason, metadata: { path: norm.raw } });
    }

    if (norm.outside) {
      return sandboxDecision({ subject: "filesystem", operation, decision: "deny", reason: "path escapes workspace boundary", metadata: { path: norm.raw, resolved: norm.resolved, real: norm.real } });
    }

    const deny = matchesAny(norm.rel, this.policy.filesystem.deny || []);
    if (deny.matched) {
      return sandboxDecision({ subject: "filesystem", operation, decision: "deny", reason: "path matched deny rule", matchedRule: deny.pattern, metadata: { path: norm.raw, relativePath: norm.rel } });
    }

    const rules = operation === "write" ? this.policy.filesystem.write : this.policy.filesystem.read;
    const allow = matchesAny(norm.rel, rules || []);
    if (allow.matched) {
      return sandboxDecision({ subject: "filesystem", operation, decision: "allow", reason: "path matched allow rule", matchedRule: allow.pattern, metadata: { path: norm.raw, relativePath: norm.rel } });
    }

    return sandboxDecision({ subject: "filesystem", operation, decision: "deny", reason: "no matching allow rule", metadata: { path: norm.raw, relativePath: norm.rel } });
  }

  canRead(path) {
    return this.evaluate("read", path);
  }

  canWrite(path) {
    return this.evaluate("write", path);
  }
}
