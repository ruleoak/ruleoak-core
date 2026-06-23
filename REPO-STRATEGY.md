# GitHub Repository Strategy

Do not split everything before v2.2.0 lands.

Recommended sequence:

1. Keep `ruleoak-core` as the main public AGPL repository for v2.2.0.
2. After the v2.2.0 story is stable, create `ruleoak-protocol` under MIT for schemas, fixtures, badges, and conformance.
3. Release `ruleoak-py` as a separate repo only after v1.0.0 tests and docs pass.
4. Release `ruleoak-agentic-skills` as a separate repo only after v1.0.0 reference skills are polished.
5. Keep enterprise connectors, hosted dashboards, premium policy packs, and vertical apps private/commercial.
