# Developer usage

RuleOak Core is a TypeScript runtime library for governing AI tool calls before execution. It provides guard and policy checks, approval gates, evidence records, audit reports, and protocol conformance tools.

RuleOak Core is easiest to evaluate in two stages: first from source, then as a local package in your own TypeScript or Node.js project.

## Path A — GitHub release / source preview

Use this path to inspect the code, run examples, review generated governance records, and decide whether RuleOak fits your agent stack.

```bash
git clone https://github.com/ruleoak/ruleoak-core.git
cd ruleoak-core
npm install
npm run quickstart:all
npm run protocol:conformance
```

What this proves:

1. Tool-call requests can be declared before execution.
2. Policy can decide allow / approve / block.
3. Approval can pause risky actions.
4. Evidence and audit events are recorded.
5. Protocol conformance can be checked locally.

## Path B — Local package install from release tarball

Use this path to try RuleOak Core inside your own TypeScript or Node.js project before using an npm registry package.

```bash
cd ruleoak-core
npm install
npm pack
cd ../your-agent-project
npm install ../ruleoak-core/ruleoak-core-2.1.0.tgz
```

Then wrap one tool-call boundary in your project:

```text
declare tool call
→ evaluate policy
→ decide allow / approve / block
→ pause for approval when required
→ record evidence and audit events
→ validate and export report
```

## What to build first

Start with one tool call. Do not try to govern the whole agent at once.

Good first candidates:

- file write
- shell command
- external message send
- GitHub/Jira read
- ticket/comment/create action
- cloud LLM upload

## What RuleOak Core is not

RuleOak Core is not an agent orchestrator, hosted SaaS service, legal compliance certification, or complete sandbox. It is an application-level governance boundary for AI tool calls routed through RuleOak.
