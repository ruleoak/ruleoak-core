# Technical Consultant Demo

This is the first copy-and-adapt RuleOak example.

It is intentionally generic. It is not branded as SRE, legal, medical, finance, or any other regulated vertical.

## What it shows

The demo reads synthetic case inputs:

```text
mock-data/
  alert.json
  logs.json
  metrics.json
  notes.md
```

Then it produces a structured report showing:

- case summary;
- evidence used;
- probable cause;
- recommended action;
- policy decision;
- approval requirement;
- audit-style output.

## Run it

From the repo root:

```bash
npm run example:consultant
```

Output:

```text
examples/technical-consultant-demo/out/case-report.json
```

## Copy it

From the repo root:

```bash
npm run create:app -- my-consultant-app
cd apps/my-consultant-app
node run.js
```

## Adapt it

Replace:

```text
policy.json
mock-data/
run.js
```

Before adding real action tools, read:

```text
docs/trust-model.md
docs/license-faq.md
```

## Boundary

This demo is safe and synthetic. It does not include production remediation automation or real customer data.


## Run with a local LLM

First check and prepare your local model:

```bash
npm run llm:doctor
npm run llm:pull
npm run llm:smoke
```

Then run this example with Ollama:

```bash
npm run example:consultant:llm
```

Override the model:

```bash
RULEOAK_OLLAMA_MODEL=qwen3:8b npm run example:consultant:llm
```

The local-LLM path writes:

```text
examples/technical-consultant-demo/out/case-report-local-llm.json
```


## Synthetic demo boundary

This demo uses synthetic data. It is designed to show the RuleOak pattern, not to prove production-grade diagnosis.

Do not treat the output as operational advice. The useful part is the structure:

```text
case inputs → evidence → recommendation → policy decision → approval boundary → audit-style report
```
