# Integrate RuleOak with Claude Code-style coding agents

Use RuleOak to govern the boundary around coding-agent actions:

- file write
- file delete
- shell command
- git operation
- dependency install
- network access
- credential access

Recommended defaults:

| Action | Default |
|---|---|
| Read source files | allow |
| Write project files | allow inside workspace, record evidence |
| Delete files | approval required or deny |
| Run shell | approval required |
| Read secrets | deny |
| Push to remote | approval required |

Keep the agent productive, but do not let it silently cross destructive boundaries.
