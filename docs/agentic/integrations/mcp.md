# Integrate RuleOak with MCP-style tools

RuleOak can sit in front of MCP-style tools as a permission gateway.

```js
import { McpPermissionGateway } from "@ruleoak/core/agentic";

const gateway = new McpPermissionGateway({
  tools: [
    { name: "search_docs", description: "Read-only document search", risk: "low" },
    { name: "delete_file", description: "Delete a workspace file", risk: "high" }
  ],
  policy: {
    allowedActions: ["search_docs"],
    blockedActions: ["delete_file"]
  }
});

const inventory = gateway.listTools();
const result = await gateway.callTool("search_docs", { query: "evidence" }, async () => ({ hits: 2 }));
```

Use this pattern for local dev first. Do not route real destructive MCP tools through demos.
