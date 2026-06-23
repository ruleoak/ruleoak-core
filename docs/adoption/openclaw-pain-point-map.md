# OpenClaw-style pain point map

| Pain point | RuleOak control | Result |
|---|---|---|
| Uncontrolled file delete | Filesystem guard, approval, dry-run, evidence | Delete is blocked or approval-gated before execution |
| Database mutation | Database guard, SQL classifier, rollback note | `DROP`, `TRUNCATE`, `ALTER` denied by default |
| Shell execution | Agent Firewall, command risk classifier | command is denied or approval-gated |
| Skill/plugin supply chain | skill/plugin scanner | suspicious permissions flagged before install |
| Broad workspace access | workspace root allowlist | path traversal and protected paths denied |
| Secret leakage | redaction and payload controls | obvious credentials not persisted in evidence |
| Autonomous email/calendar send | approval and preview | send-like actions pause for confirmation |
| Poor incident visibility | Flight Recorder and Action Replay | timeline and report generated from evidence |
