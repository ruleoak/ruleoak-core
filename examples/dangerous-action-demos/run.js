import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AgentFirewall,
  AgentDryRunMode,
  ApprovalLinkProtocol,
  FlightRecorder,
  LocalEvidenceVault,
  ToolRiskScanner,
  compileRuleOakPolicyFromPrompt,
  filterToolsForLeastPrivilege,
  generateAgentIncidentReport,
  renderAgentTrustScoreMarkdown,
  calculateAgentTrustScore,
  constitutionPackToManifest,
  validateRuleOakManifest
} from "../../src/agentic/index.js";

const dir = mkdtempSync(join(tmpdir(), "ruleoak-danger-demo-"));
try {
  const evidencePath = join(dir, "evidence.jsonl");
  const recorder = new FlightRecorder({ runId: "ruleoak-dangerous-demo", filePath: evidencePath, actor: "demo-agent" });
  const policy = {
    allowedActions: ["search.read"],
    approvalRequired: ["email.send", "shell.execute"],
    blockedActions: ["filesystem.delete", "credential.read", "production.deploy"],
    dryRunOnly: ["browser.purchase"]
  };
  const firewall = new AgentFirewall({ policy, recorder });
  const approval = new ApprovalLinkProtocol({ recorder });
  const dryRun = new AgentDryRunMode({ firewall, recorder, simulators: { filesystem: () => ({ wouldDelete: "important-file.md" }), default: () => ({ simulated: true }) } });

  recorder.startRun({ demo: "dangerous-action-demos" });
  const actions = [
    { actionId: "safe-search", toolName: "search", operation: "read", target: "docs" },
    { actionId: "wrong-email", toolName: "email", operation: "send", target: "external-recipient@example.com", input: { body: "draft only" } },
    { actionId: "delete-file", toolName: "filesystem", operation: "delete", target: "important-file.md" },
    { actionId: "shell", toolName: "shell", operation: "execute", input: { command: "rm -rf ./" } },
    { actionId: "secret", toolName: "credential", operation: "read", input: { apiKey: "SHOULD_NOT_APPEAR" } }
  ];

  const results = [];
  for (const action of actions) {
    if (action.toolName === "filesystem") results.push(await dryRun.preview(action));
    results.push(await firewall.guardAction(action, async () => ({ ok: true, sideEffect: "mock-only" })));
    const last = results.at(-1);
    if (last.decision?.approvalRequired) approval.createRequest(action, { risk: last.decision.risk, reason: last.decision.reason });
  }
  recorder.finishRun({ result: "demo complete" });

  const vault = LocalEvidenceVault.fromJsonlFile(evidencePath);
  const incident = generateAgentIncidentReport(vault.search(), { incidentId: "demo-incident" });
  const manifest = constitutionPackToManifest("personal-assistant");
  const trust = calculateAgentTrustScore({ manifest, tools: actions.map((a) => ({ name: `${a.toolName}.${a.operation}`, description: a.target || a.operation, inputSchema: { type: "object" } })), replaySupported: true, safetyCi: { ok: true } });

  console.log("RuleOak Dangerous Action Demos");
  console.log("===============================");
  for (const result of results) {
    const decision = result.decision?.decision || result.decision?.policyDecision || "dry_run";
    const action = result.decision?.actionId || result.action?.actionId || "preview";
    console.log(`- ${action}: ${decision} executed=${Boolean(result.executed)} realSideEffects=${result.realSideEffectsExecuted ?? false}`);
  }
  console.log(`Evidence events: ${vault.summary().counts.total}`);
  console.log(`Redaction check: ${vault.redactionCheck().ok ? "pass" : "fail"}`);
  console.log(`Incident severity: ${incident.severity}`);
  console.log(renderAgentTrustScoreMarkdown(trust).split("\n").slice(0, 5).join("\n"));
  console.log(`Manifest validation: ${validateRuleOakManifest(manifest).ok ? "pass" : "fail"}`);

  const compiled = compileRuleOakPolicyFromPrompt("No shell.execute without approval. Block credential.read. Allow search.read.");
  const filtered = filterToolsForLeastPrivilege({ task: { requiredCapabilities: ["search"] }, tools: [{ name: "search.read", capabilities: ["search"] }, { name: "credential.read", capabilities: ["secret"] }], policy: compiled.policy });
  console.log(`Least privilege exposed tools: ${filtered.allowedTools.map((t) => t.name).join(", ")}`);
  console.log(new ToolRiskScanner().renderMarkdown(new ToolRiskScanner().scanTools(actions.map((a) => ({ name: `${a.toolName}.${a.operation}`, description: a.target || a.operation })))).split("\n").slice(0, 6).join("\n"));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
