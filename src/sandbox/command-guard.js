import { basename } from "node:path";
import { mergeSandboxPolicy, sandboxDecision } from "./sandbox-policy.js";

const SHELL_META = /[;&|`$<>]/;

function commandName(input) {
  if (Array.isArray(input)) return basename(String(input[0] || ""));
  const text = String(input || "").trim();
  if (!text) return "";
  return basename(text.split(/\s+/)[0]);
}

export class CommandGuard {
  constructor({ policy = {} } = {}) {
    this.policy = mergeSandboxPolicy(policy);
  }

  evaluate(input, operation = "execute") {
    const text = Array.isArray(input) ? input.join(" ") : String(input || "");
    if (SHELL_META.test(text)) {
      return sandboxDecision({ subject: "command", operation, decision: "deny", reason: "shell metacharacters are denied in security foundation", metadata: { command: text } });
    }

    const name = commandName(input);
    if (!name) {
      return sandboxDecision({ subject: "command", operation, decision: "deny", reason: "missing command name", metadata: { command: text } });
    }

    if ((this.policy.commands.deny || []).includes(name)) {
      return sandboxDecision({ subject: "command", operation, decision: "deny", reason: "command matched deny rule", matchedRule: name, metadata: { command: text, name } });
    }
    if ((this.policy.commands.approval_required || []).includes(name)) {
      return sandboxDecision({ subject: "command", operation, decision: "approval_required", reason: "command requires approval", matchedRule: name, metadata: { command: text, name } });
    }
    if ((this.policy.commands.allow || []).includes(name)) {
      return sandboxDecision({ subject: "command", operation, decision: "allow", reason: "command matched allow rule", matchedRule: name, metadata: { command: text, name } });
    }
    return sandboxDecision({ subject: "command", operation, decision: "deny", reason: "command is not declared in allowlist", metadata: { command: text, name } });
  }
}
