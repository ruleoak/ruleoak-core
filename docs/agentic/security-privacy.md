# Security and privacy

RuleOak is local-first by default. Evidence is valuable only if it is safe to store and replay.

## Defaults

- Redact tokens, passwords, API keys, cookies, bearer headers, private keys, and obvious connection strings.
- Deny or approval-gate high-risk actions.
- Use dry-run mode before write/delete/send/deploy actions.
- Store evidence locally unless explicitly configured otherwise.

## Limits

RuleOak does not certify that an agent is secure or compliant. It provides a policy, evidence, approval, and replay layer that developers can inspect and test.
