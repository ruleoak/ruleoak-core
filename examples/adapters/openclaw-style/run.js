import { OpenClawSafetyShield, AgentActionReplay } from "../../../src/agentic/index.js";
const shield = new OpenClawSafetyShield();
await shield.handleActions([
  { type: "read_context", input: { topic: "demo" } },
  { type: "email_send", to: "demo@example.com", body: "hello" },
  { type: "file_delete", path: "/tmp/important" }
]);
console.log(new AgentActionReplay({ events: shield.report().events }).toText());
