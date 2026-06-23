# RuleOak v2.2.0 OpenClaw-style adoption plan

RuleOak should approach OpenClaw-style agent projects as an optional safety and evidence layer, not as a replacement runtime.

## Three tracks

### Track A — standalone demo, no upstream dependency

Build and publish an OpenClaw-style adapter demo that shows how RuleOak guards dangerous agent actions. This works even if upstream projects do not accept a PR.

### Track B — optional upstream PR

Offer a small optional integration pattern that lets users install RuleOak separately. Do not force AGPL runtime dependencies into permissive projects.

### Track C — protocol-only compatibility

Let OpenClaw-style projects emit RuleOak Evidence JSONL v1 and `.ruleoak.yml` metadata without linking the AGPL runtime.

## 30-day sequence

1. Week 1: publish safe demo and adapter package.
2. Week 2: create protocol-only package and badge verifier.
3. Week 3: prepare upstream-friendly PR package.
4. Week 4: engage maintainers with non-hostile language and private disclosure process when appropriate.

## Positioning

RuleOak helps AI agent projects provide permission control, dry-run, approval, evidence, replay, and incident visibility around actions such as file delete, shell execution, database mutation, email send, plugin install, and secret access.
