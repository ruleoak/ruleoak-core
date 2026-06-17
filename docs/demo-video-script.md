# Two-Minute Demo Script

This script matches the README GIF for RuleOak Core v1.0.

## Goal

Show that RuleOak can be understood quickly through one guided launch path.

## Script

### 0:00–0:15 — Positioning

Say:

> RuleOak Core v1.0 is an AGPL early runtime with a deny-by-default sandbox foundation for governed AI workflows: policy, evidence, approval, and audit.

Show:

```bash
npm install
npm run launch
```

### 0:15–0:40 — Guided launch path

Point out that `npm run launch` runs the first-user flow:

- examples list;
- consultant demo;
- research demo;
- sandbox demo;
- HTML report generation;
- next-step commands.

### 0:40–1:05 — Run all demos

Show:

```bash
npm run demo
```

Point out:

- consultant case analysis;
- research brief workflow;
- sandbox decisions;
- one-page generated reports.

### 1:05–1:30 — View reports locally

Show:

```bash
npm run report:view
```

Say:

> RuleOak generates local HTML reports and serves them from a local-only browser viewer.

### 1:30–1:45 — Create a workflow

Show:

```bash
npm run roak:init -- my-workflow --template=consultant-workflow
```

Say:

> Developers can copy a template instead of starting from a blank repo.

### 1:45–2:00 — Boundary

Show:

```bash
npm test
```

Say:

> RuleOak Core v1.0 is an early runtime foundation. It is not a finished enterprise platform or externally security-reviewed sandbox.
