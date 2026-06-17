# Quickstart

## Run the sample app

```bash
npm install
npm run example:consultant
```

This runs a fake technical-consultant workflow and writes an audit-style report to:

```text
examples/technical-consultant-demo/out/case-report.json
```

## Create your own app from the sample

```bash
npm run create:app -- my-consultant-app
cd apps/my-consultant-app
node run.js
```

Then edit:

```text
policy.json
mock-data/
run.js
```

## Inspect the package boundary

```bash
npm run inspect
```

## Typecheck contracts

```bash
npm run typecheck
```

## What next?

- Read `docs/why-ruleoak.md` for the competitive angle.
- Read `docs/trust-model.md` before adding real tools or real data.
- Read `docs/license-faq.md` before building a product on top of RuleOak Core.
- Copy `examples/basic-domain-pack` when you want to create a reusable domain pack.
