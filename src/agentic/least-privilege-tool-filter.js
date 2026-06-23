import { ToolRiskScanner } from "./tool-risk-scanner.js";

function taskTokens(task = {}) {
  return [task.intent, task.type, task.description, task.goal, ...(Array.isArray(task.requiredCapabilities) ? task.requiredCapabilities : [])]
    .filter(Boolean).join(" ").toLowerCase();
}

export function filterToolsForLeastPrivilege({ task = {}, tools = [], policy = {}, approvalState = {}, recorder = null, actor = "agent" } = {}) {
  const text = taskTokens(task);
  const scanner = new ToolRiskScanner();
  const scan = scanner.scanTools(tools);
  const approved = new Set(Array.isArray(approvalState.approvedTools) ? approvalState.approvedTools : []);
  const allowed = new Set(policy.allowedActions || policy.allowed_actions || []);
  const blocked = new Set(policy.blockedActions || policy.blocked_actions || []);
  const approvalRequired = new Set(policy.approvalRequired || policy.approval_required || []);
  const requiredCapabilities = new Set(task.requiredCapabilities || []);

  const allowedTools = [];
  const withheldTools = [];
  for (const risk of scan.results) {
    const tool = risk.tool;
    const name = risk.name;
    const capabilities = tool.capabilities || [];
    const capabilityMatch = !requiredCapabilities.size || capabilities.some((cap) => requiredCapabilities.has(cap)) || text.includes(name.toLowerCase()) || text.includes(String(tool.description || "").toLowerCase().slice(0, 16));
    let reason = "allowed";
    let expose = capabilityMatch || allowed.has(name);
    if (blocked.has(name)) { expose = false; reason = "blocked by policy"; }
    else if ((risk.risk === "high" || approvalRequired.has(name)) && !approved.has(name) && !allowed.has(name)) { expose = false; reason = "requires approval"; }
    else if (!expose) reason = "not needed for current task";
    const entry = { ...risk, reason };
    if (expose) allowedTools.push(tool); else withheldTools.push(entry);
  }

  const decision = { schemaVersion: "ruleoak.least_privilege_filter.v1", task, allowedTools, withheldTools, scan };
  if (recorder) recorder.record("tool_filter_decision", { actor, task, allowedTools: allowedTools.map((t) => t.name || t.id), withheldTools: withheldTools.map((t) => ({ name: t.name, reason: t.reason, risk: t.risk })) });
  return decision;
}
