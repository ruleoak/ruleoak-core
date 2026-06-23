# RuleOak-compatible agent safety model

A RuleOak-compatible agent has four observable layers:

1. **Declared permissions** — `.ruleoak.yml` or equivalent manifest.
2. **Pre-action control** — Agent Firewall decision before tool execution.
3. **Human gate** — approval, deny, or edit for risky actions.
4. **Post-action evidence** — Evidence JSONL v1 for replay and incident review.

Compatibility does not mean certification. It means the project can emit evidence and describe permissions in a RuleOak-readable way.
