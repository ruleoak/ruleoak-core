export const DEFAULT_SANDBOX_POLICY = Object.freeze({
  stage: "security foundation",
  default: "deny",
  filesystem: {
    read: ["examples/**", "docs/**", "configs/**", "cases/**", "runbooks/**"],
    write: ["out/**", "examples/**/out/**"],
    deny: [".env", "**/.env", "**/*secret*", "**/*token*", "**/id_rsa", "**/id_ed25519", "**/.ssh/**", "**/.aws/**"]
  },
  network: {
    default: "deny",
    allow: ["localhost", "127.0.0.1", "::1"]
  },
  commands: {
    default: "deny",
    allow: ["node", "cat", "grep", "jq"],
    approval_required: ["git", "docker", "kubectl"],
    deny: ["rm", "curl", "nc", "netcat", "ssh", "scp", "bash", "sh", "zsh", "powershell", "pwsh"]
  },
  tools: {
    "logs.read": "allow",
    "metrics.read": "allow",
    "evidence.read": "allow",
    "report.export": "allow",
    "brief.export": "allow",
    "service.restart": "approval_required",
    "email.send": "approval_required",
    "brief.publish": "approval_required",
    "shell.exec": "deny",
    "network.fetch": "deny"
  }
});

export function mergeSandboxPolicy(policy = {}) {
  return {
    ...DEFAULT_SANDBOX_POLICY,
    ...policy,
    filesystem: { ...DEFAULT_SANDBOX_POLICY.filesystem, ...(policy.filesystem || {}) },
    network: { ...DEFAULT_SANDBOX_POLICY.network, ...(policy.network || {}) },
    commands: { ...DEFAULT_SANDBOX_POLICY.commands, ...(policy.commands || {}) },
    tools: { ...DEFAULT_SANDBOX_POLICY.tools, ...(policy.tools || {}) }
  };
}

export function sandboxDecision({ subject, operation, decision, reason, matchedRule = null, metadata = {} }) {
  const allowed = decision === "allow";
  const approvalRequired = decision === "approval_required";
  return {
    subject,
    operation,
    decision,
    allowed,
    approvalRequired,
    denied: decision === "deny",
    reason,
    matchedRule,
    metadata,
    stage: "security foundation"
  };
}
