import { mergeSandboxPolicy, sandboxDecision } from "./sandbox-policy.js";

function hostFromTarget(target) {
  if (!target) return "";
  try {
    const url = new URL(String(target).includes("://") ? String(target) : `http://${target}`);
    return url.hostname;
  } catch {
    return String(target).split(":")[0];
  }
}

export class NetworkGuard {
  constructor({ policy = {} } = {}) {
    this.policy = mergeSandboxPolicy(policy);
  }

  evaluate(target, operation = "connect") {
    const host = hostFromTarget(target);
    const allow = new Set(this.policy.network.allow || []);
    if (allow.has(host)) {
      return sandboxDecision({ subject: "network", operation, decision: "allow", reason: "host matched allowlist", matchedRule: host, metadata: { target, host } });
    }
    return sandboxDecision({ subject: "network", operation, decision: "deny", reason: "network is deny-by-default and host is not allowlisted", metadata: { target, host } });
  }
}
