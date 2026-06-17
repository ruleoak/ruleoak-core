import { mergeSandboxPolicy, sandboxDecision } from "./sandbox-policy.js";

export class ToolRegistry {
  constructor({ policy = {} } = {}) {
    this.policy = mergeSandboxPolicy(policy);
    this.tools = new Map();
    for (const [name, decision] of Object.entries(this.policy.tools || {})) {
      this.register({ name, decision });
    }
  }

  register({ name, decision = "deny", risk = "unknown", description = "" }) {
    if (!name) throw new Error("tool name is required");
    this.tools.set(name, { name, decision, risk, description });
    return this.tools.get(name);
  }

  evaluate(name, operation = "call") {
    const tool = this.tools.get(name);
    if (!tool) {
      return sandboxDecision({ subject: "tool", operation, decision: "approval_required", reason: "unknown tool requires review", metadata: { tool: name } });
    }
    if (tool.decision === "allow") {
      return sandboxDecision({ subject: "tool", operation, decision: "allow", reason: "tool allowed by sandbox policy", matchedRule: name, metadata: { tool: name, risk: tool.risk } });
    }
    if (tool.decision === "approval_required") {
      return sandboxDecision({ subject: "tool", operation, decision: "approval_required", reason: "tool requires approval by sandbox policy", matchedRule: name, metadata: { tool: name, risk: tool.risk } });
    }
    return sandboxDecision({ subject: "tool", operation, decision: "deny", reason: "tool denied by sandbox policy", matchedRule: name, metadata: { tool: name, risk: tool.risk } });
  }

  list() {
    return [...this.tools.values()];
  }
}

export class ToolPermissionEvaluator extends ToolRegistry {}
