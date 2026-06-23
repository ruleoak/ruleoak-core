# Integrate RuleOak with a local LLM agent

Local LLM agents need governance because they often receive broad filesystem and shell access.

Minimum setup:

1. Use `.ruleoak.yml` to declare allowed tools.
2. Use least-privilege tool filtering before the model sees the tool list.
3. Route tool calls through Agent Firewall.
4. Record evidence locally.
5. Replay evidence after each run.

This keeps the privacy benefit of local-first AI while adding accountability.
