# LLM Risk Mapping

RuleOak's sandbox foundation treats LLM risks as runtime containment problems, not only prompt-writing problems.

| LLM risk pattern | RuleOak containment approach |
|---|---|
| Prompt injection | Untrusted content cannot change tool permissions or sandbox policy |
| Insecure output handling | LLM output is treated as a proposal and evaluated outside the model |
| Sensitive information disclosure | Filesystem and network boundaries reduce accidental leakage |
| Excessive agency | Tools and commands are deny-by-default, with approval-required mode |
| Model denial of service | Future: timeouts, token budgets, and run cancellation |
| Supply-chain risk | Future: SBOM, dependency scanning, signed releases |

## Not complete yet

The current sandbox foundation is a first-launch control layer. Future work should add deeper prompt-injection fixtures, connector-level controls, dependency hardening, SBOM generation, and external security review.
