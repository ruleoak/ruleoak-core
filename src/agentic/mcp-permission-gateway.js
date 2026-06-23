import { McpGuard } from "../guard/mcp-guard.js";
import { McpServerManifest } from "../guard/mcp-manifest.js";
import { ToolRiskClassifier } from "../guard/risk-classifier.js";
import { FlightRecorder } from "./flight-recorder.js";

function normalizeGatewayTool(tool = {}) {
  return {
    name: tool.name || tool.id,
    description: tool.description || "",
    inputSchema: tool.inputSchema || tool.input_schema || tool.schema || null,
    annotations: tool.annotations || {},
    metadata: tool.metadata || {}
  };
}

export class McpPermissionGateway {
  constructor({ server = {}, manifest = null, policy = {}, recorder = null, actor = "mcp-permission-gateway", runId, clock, handler = null } = {}) {
    this.serverManifest = manifest instanceof McpServerManifest ? manifest : McpServerManifest.fromObject(server);
    this.policy = policy || {};
    this.recorder = recorder || new FlightRecorder({ runId, actor, clock });
    this.guard = new McpGuard({ manifest: this.serverManifest, policy, runId: this.recorder.runId, actor });
    this.riskClassifier = new ToolRiskClassifier();
    this.handler = handler || (async () => ({ ok: true, dryRun: true, simulated: true }));
    this.records = [];
    this.recorder.record("mcp_gateway_started", { server: this.serverManifest.inspect(), toolCount: this.tools().length });
  }

  tools() {
    return this.serverManifest.tools.map(normalizeGatewayTool);
  }

  inventory() {
    const tools = this.tools().map((tool) => {
      const risk = this.riskClassifier.classify({ id: tool.name, name: tool.name, description: tool.description, kind: "mcp_tool", risk: tool.metadata?.risk || "auto" }, { toolId: tool.name, subject: tool.description });
      return {
        name: tool.name,
        description: tool.description,
        risk,
        inputSchemaPresent: !!tool.inputSchema,
        annotations: tool.annotations,
        metadata: tool.metadata
      };
    });
    return {
      schemaVersion: "ruleoak.mcp_permission_gateway.inventory.v1",
      server: this.serverManifest.inspect(),
      toolCount: tools.length,
      tools
    };
  }

  inspect() {
    const inventory = this.inventory();
    this.recorder.record("mcp_gateway_inventory", inventory);
    return inventory;
  }

  async callTool({ name, arguments: args = {}, subject = null, actor = "mcp-client", requestId = null } = {}) {
    if (!name) throw new Error("callTool requires name");
    const decision = this.guard.evaluateMcpToolCall({ name, arguments: args, subject, actor, metadata: { requestId } });
    this.recorder.record("action_requested", { actionId: decision.requestId, toolName: name, operation: "mcp.tools/call", target: subject, input: args, actor });
    this.recorder.record("policy_decision", { actionId: decision.requestId, toolName: name, decision: decision.decision, reason: decision.reason, risk: decision.risk });

    if (decision.blocked || decision.approvalRequired) {
      const blockedResult = { decision, executed: false, result: null };
      this.records.push(blockedResult);
      if (decision.approvalRequired) this.recorder.record("approval_requested", { actionId: decision.requestId, toolName: name, status: "pending", reason: decision.reason });
      return blockedResult;
    }

    const result = await this.handler({ name, arguments: args, subject, actor }, decision);
    this.recorder.record("action_executed", { actionId: decision.requestId, result });
    const record = { decision, executed: true, result };
    this.records.push(record);
    return record;
  }

  async handleJsonRpc(request = {}) {
    if (request.jsonrpc !== "2.0") throw new Error("McpPermissionGateway expects JSON-RPC 2.0 request objects");
    if (request.method === "tools/list") return { jsonrpc: "2.0", id: request.id ?? null, result: this.inventory() };
    if (request.method !== "tools/call") return { jsonrpc: "2.0", id: request.id ?? null, error: { code: -32601, message: `Unsupported method: ${request.method}` } };
    const toolName = request.params?.name || request.params?.tool;
    const output = await this.callTool({ name: toolName, arguments: request.params?.arguments || {}, subject: request.params?.subject || null, requestId: request.id });
    if (output.decision.blocked) return { jsonrpc: "2.0", id: request.id ?? null, error: { code: -32003, message: "RuleOak blocked MCP tool call", data: output.decision } };
    if (output.decision.approvalRequired) return { jsonrpc: "2.0", id: request.id ?? null, error: { code: -32001, message: "RuleOak approval required before MCP tool call", data: output.decision } };
    return { jsonrpc: "2.0", id: request.id ?? null, result: { ruleoak: output.decision, server: output.result } };
  }

  report(options = {}) {
    return {
      runtimeStage: "mcp-permission-gateway",
      title: options.title || "RuleOak MCP Permission Gateway Report",
      summary: options.summary || "MCP tools inventoried and governed before execution.",
      inventory: this.inventory(),
      records: [...this.records],
      evidence: this.recorder.list(),
      boundaryNote: "MCP Permission Gateway is local and offline-friendly in this release. It inventories and governs MCP-style tool calls but does not operate a hosted registry."
    };
  }
}
