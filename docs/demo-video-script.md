# RuleOak 60-Second Demo Script

This script matches `docs/assets/demo/ruleoak-60s-governance-demo.gif`.

## Goal

Show the first-time path from install to governance result:

```text
install → launch → policy decision → evidence → approval → audit report
```

## Script

### 0-10 seconds: install

```bash
npm install
```

Explain: RuleOak runs locally and does not require a hosted service for the demo path.

### 10-20 seconds: launch

```bash
npm run launch
```

Explain: the launch command runs the guided first-user flow.

### 20-30 seconds: policy decision

Show a proposed action and the policy result:

```text
proposed action: publish_report
policy decision: approval_required
```

Explain: RuleOak evaluates actions before execution.

### 30-40 seconds: evidence

Show evidence attached to the recommendation.

Explain: RuleOak separates model output from evidence-backed records.

### 40-50 seconds: approval

Show approval required or denied.

Explain: risky actions can pause for human review.

### 50-60 seconds: audit report

```bash
npm run report:view
```

Explain: the local report viewer shows run, evidence, policy, approval, and audit records.
