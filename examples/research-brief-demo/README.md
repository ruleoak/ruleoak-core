# Research Brief Demo

This demo shows that RuleOak is not limited to IT operations or technical-consultant workflows.

It applies the same governed-agent pattern to a general research brief:

```text
policy → evidence → approval → audit
```

## What it shows

- sourced claims;
- confidence labels;
- known unknowns;
- recommendation separated from evidence;
- approval required before publishing or sending externally;
- audit-style report output.

## Run it

From the repo root:

```bash
npm run example:research
```

Output:

```text
examples/research-brief-demo/out/research-brief-report.json
```

## Run with a local LLM

```bash
npm run llm:doctor
npm run llm:pull
npm run example:research:llm
```

Override the model:

```bash
RULEOAK_OLLAMA_MODEL=qwen3:8b npm run example:research:llm
```

## Why this demo exists

The consultant demo proves RuleOak can support action-oriented case analysis.

The research demo proves the same core can support non-IT workflows where the main challenge is not remediation, but evidence quality:

```text
source review → claim extraction → confidence → recommendation → approval boundary
```

## Boundary

This is synthetic data. It is not legal, medical, financial, compliance, or production research advice.
