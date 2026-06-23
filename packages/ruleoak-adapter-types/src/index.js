export const ADAPTER_ENVELOPE_VERSION = "ruleoak.adapter.envelope.v1";
export function createActionEnvelope(input = {}) { return { version: ADAPTER_ENVELOPE_VERSION, toolName: input.toolName || "unknown", operation: input.operation || "unknown", target: input.target || null, input: input.input || {}, riskHints: input.riskHints || [] }; }
