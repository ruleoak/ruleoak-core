import { AgentFirewall } from "./agent-firewall.js";
import { redactValue } from "./redaction.js";

export class AgentDryRunMode {
  constructor({ firewall = null, policy = {}, recorder = null, simulators = {}, actor = "agent", clock } = {}) {
    this.firewall = firewall || new AgentFirewall({ policy, recorder, actor, clock });
    this.recorder = this.firewall.recorder;
    this.simulators = simulators;
  }

  async preview(action = {}) {
    const decision = this.firewall.evaluateAction({ ...action, approved: false });
    const simulator = this.simulators[action.toolName || action.tool || action.name] || this.simulators.default;
    const simulatedOutput = typeof simulator === "function" ? await simulator(action, decision) : { simulated: true, wouldExecute: decision.decision === "allow" };
    const preview = {
      schemaVersion: "ruleoak.dry_run_preview.v1",
      action: redactValue(action),
      decision,
      simulatedOutput: redactValue(simulatedOutput),
      realSideEffectsExecuted: false,
      label: "simulation only"
    };
    this.recorder.record("dry_run_preview", preview);
    return preview;
  }
}

export async function dryRunAction(action = {}, options = {}) {
  return new AgentDryRunMode(options).preview(action);
}
