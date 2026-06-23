export const AI_AGENT_CONSTITUTION_PACKS = Object.freeze({
  "personal-assistant": {
    name: "personal-assistant",
    allowedActions: ["search.read", "calendar.read", "notes.read"],
    approvalRequired: ["email.send", "calendar.update", "message.send"],
    blockedActions: ["payment.spend", "filesystem.delete", "shell.execute"],
    dryRunOnly: ["browser.purchase"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "coding-agent": {
    name: "coding-agent",
    allowedActions: ["filesystem.read", "git.diff", "test.run"],
    approvalRequired: ["filesystem.write", "git.commit", "shell.execute"],
    blockedActions: ["credential.read", "production.deploy", "filesystem.delete"],
    dryRunOnly: ["dependency.install"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "research-agent": {
    name: "research-agent",
    allowedActions: ["search.read", "document.read", "citation.extract", "summarize.read"],
    approvalRequired: ["document.export", "message.send"],
    blockedActions: ["claim.publish_without_source", "filesystem.delete", "payment.spend"],
    dryRunOnly: [],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "finance-readonly": {
    name: "finance-readonly",
    allowedActions: ["market.read", "portfolio.read", "report.generate"],
    approvalRequired: ["order.prepare", "broker.connect"],
    blockedActions: ["order.submit", "trade.execute", "payment.spend"],
    dryRunOnly: ["order.simulate"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "sre-production": {
    name: "sre-production",
    allowedActions: ["metrics.read", "logs.read", "runbook.read", "ticket.read"],
    approvalRequired: ["threshold.update", "runbook.execute", "service.restart", "ticket.update"],
    blockedActions: ["production.deploy", "database.drop", "secret.read"],
    dryRunOnly: ["change.simulate", "rollback.preview"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "file-management": {
    name: "file-management",
    allowedActions: ["filesystem.read", "filesystem.list", "filesystem.copy"],
    approvalRequired: ["filesystem.write", "filesystem.move", "filesystem.archive"],
    blockedActions: ["filesystem.delete", "filesystem.wipe", "credential.read"],
    dryRunOnly: ["filesystem.bulk_change"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  },
  "email-calendar": {
    name: "email-calendar",
    allowedActions: ["email.read", "calendar.read", "contacts.read"],
    approvalRequired: ["email.send", "calendar.create", "calendar.update", "contacts.update"],
    blockedActions: ["email.bulk_send", "credential.read", "payment.spend"],
    dryRunOnly: ["email.draft"],
    evidence: { enabled: true, format: "jsonl" },
    redaction: { enabled: true }
  }
});

export function getAgentConstitutionPack(name) {
  const pack = AI_AGENT_CONSTITUTION_PACKS[name];
  if (!pack) throw new Error(`unknown RuleOak constitution pack: ${name}`);
  return structuredClone(pack);
}

export function listAgentConstitutionPacks() {
  return Object.keys(AI_AGENT_CONSTITUTION_PACKS).map((name) => ({ name, ...AI_AGENT_CONSTITUTION_PACKS[name] }));
}

export function mergeAgentConstitutionPacks(names = [], overrides = {}) {
  const merged = { allowedActions: [], approvalRequired: [], blockedActions: [], dryRunOnly: [], evidence: { enabled: true, format: "jsonl" }, redaction: { enabled: true }, policyPacks: names };
  for (const name of names) {
    const pack = getAgentConstitutionPack(name);
    for (const key of ["allowedActions", "approvalRequired", "blockedActions", "dryRunOnly"]) merged[key].push(...(pack[key] || []));
  }
  for (const key of ["allowedActions", "approvalRequired", "blockedActions", "dryRunOnly"]) merged[key] = [...new Set([...(merged[key] || []), ...(overrides[key] || [])])];
  return { ...merged, ...overrides, permissions: { allowedActions: merged.allowedActions, approvalRequired: merged.approvalRequired, blockedActions: merged.blockedActions, dryRunOnly: merged.dryRunOnly } };
}

export function constitutionPackToManifest(name) {
  const pack = getAgentConstitutionPack(name);
  return {
    version: "ruleoak.manifest.v1",
    project: { name: `ruleoak-${name}-agent` },
    agent: { name, runtime: "generic" },
    permissions: {
      allowedActions: pack.allowedActions,
      approvalRequired: pack.approvalRequired,
      blockedActions: pack.blockedActions,
      dryRunOnly: pack.dryRunOnly
    },
    evidence: pack.evidence,
    redaction: pack.redaction,
    policyPacks: [name]
  };
}
