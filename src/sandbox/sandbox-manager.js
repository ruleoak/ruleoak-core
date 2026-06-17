import { FilesystemGuard } from "./filesystem-guard.js";
import { NetworkGuard } from "./network-guard.js";
import { CommandGuard } from "./command-guard.js";
import { ToolRegistry } from "./tool-registry.js";
import { mergeSandboxPolicy } from "./sandbox-policy.js";

export class SandboxManager {
  constructor({ policy = {}, workspaceRoot = process.cwd(), auditLog } = {}) {
    this.policy = mergeSandboxPolicy(policy);
    this.auditLog = auditLog;
    this.filesystem = new FilesystemGuard({ policy: this.policy, workspaceRoot });
    this.network = new NetworkGuard({ policy: this.policy });
    this.commands = new CommandGuard({ policy: this.policy });
    this.tools = new ToolRegistry({ policy: this.policy });
  }

  record(decision) {
    this.auditLog?.record("sandbox.evaluated", decision);
    return decision;
  }

  canRead(path) { return this.record(this.filesystem.canRead(path)); }
  canWrite(path) { return this.record(this.filesystem.canWrite(path)); }
  canConnect(target) { return this.record(this.network.evaluate(target)); }
  canExecute(command) { return this.record(this.commands.evaluate(command)); }
  canUseTool(tool) { return this.record(this.tools.evaluate(tool)); }

  inspect() {
    return {
      stage: "security foundation",
      default: this.policy.default || "deny",
      controls: ["filesystem", "network", "commands", "tools"],
      claim: "deny-by-default sandbox foundation with tested policy boundaries, not an externally security-reviewed sandbox"
    };
  }
}
