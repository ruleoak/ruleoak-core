# RuleOak Developer Guide

RuleOak v2.2.0 gives developers a stable way to put a policy and evidence boundary around agent actions.

## Core flow

1. Define a `.ruleoak.yml` manifest.
2. Wrap tool calls with `AgentFirewall`.
3. Record the action timeline with `FlightRecorder`.
4. Use approval or dry-run for risky actions.
5. Validate Evidence JSONL v1.
6. Replay evidence during debugging or incident review.
7. Add Safety CI and badges when publishing your agent project.

## Install and run

```bash
npm install
npm run agentic:quickstart
npm run agentic:public-demo
```

## Stable import

```js
import {
  AgentFirewall,
  FlightRecorder,
  validateEvidenceJsonlText,
  validateRuleOakManifest,
  AgentActionReplay
} from "@ruleoak/core/agentic";
```

## Recommended adoption path

Start with recording, then add policy, then approval, then CI:

1. Flight Recorder only.
2. Agent Firewall with safe defaults.
3. Approval Link Protocol for high-risk operations.
4. Evidence replay and incident report.
5. `.ruleoak.yml` plus Safety CI.

## Safe defaults

RuleOak treats write, delete, shell, send, spend, deploy, production-change, and credential actions as risky. Unknown risky actions should fail closed.
