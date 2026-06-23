import { McpPermissionGateway, FlightRecorder, AgentActionReplay } from "../../../src/agentic/index.js";
const recorder = new FlightRecorder({ runId: "adapter-mcp" });
const gateway = new McpPermissionGateway({
  recorder,
  tools: [
    { name: "search.read", description: "Read search index", capabilities: ["search"] },
    { name: "filesystem.delete", description: "Delete local file", capabilities: ["delete"] }
  ],
  policy: { allowedActions: ["search.read"], blockedActions: ["filesystem.delete"] }
});
console.log(JSON.stringify(gateway.inventory(), null, 2));
await gateway.callTool({ name: "search.read", arguments: { q: "ruleoak" } });
await gateway.callTool({ name: "filesystem.delete", arguments: { path: "/tmp/important" } });
console.log(new AgentActionReplay({ events: recorder.list() }).toMarkdown());
