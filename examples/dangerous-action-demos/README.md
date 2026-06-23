# RuleOak Dangerous Action Demos

Safe offline demos that show RuleOak governing dangerous agent actions before execution.

Run:

```bash
npm run agentic:dangerous-demo
```

The demo uses mock actions only. It does not send email, delete files, read secrets, run shell commands, deploy production changes, or call external services.

It demonstrates Ideas 6–20 on top of the Ideas 1–5 foundation:

- `.ruleoak.yml`-style manifest validation
- badge/trust-score primitives
- tool risk scanning
- least-privilege tool filtering
- approval requests
- dry-run previews
- incident report generation
- local evidence vault indexing
- policy prompt compilation
- constitution pack usage
