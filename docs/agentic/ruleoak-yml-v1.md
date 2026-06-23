# `.ruleoak.yml` v1

Manifest version: `ruleoak.manifest.v1`.

A RuleOak manifest declares what an agent can do, what needs approval, what is blocked, and how evidence is recorded.

Minimal example:

```yaml
version: ruleoak.manifest.v1
project:
  name: demo-agent
agent:
  name: demo-agent
permissions:
  allowedActions:
    - search.read
  approvalRequired:
    - email.send
  blockedActions:
    - filesystem.delete
    - shell.execute
evidence:
  enabled: true
  format: jsonl
  replayable: true
redaction:
  enabled: true
```
