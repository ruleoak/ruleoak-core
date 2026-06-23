# License-safe integration strategy

RuleOak Core remains AGPL-3.0-or-later with commercial licensing available. To make adoption easier, the protocol layer should be permissive.

## Split

| Layer | License | Purpose |
|---|---|---|
| `@ruleoak/core` runtime | AGPL/commercial | enforcement, firewall, recorder, replay, vault |
| `ruleoak-protocol` | MIT | schemas, evidence format, manifests, fixtures, badges |
| adapter interface types | MIT | low-friction external integration |
| enterprise connectors | commercial | monetizable production integrations |

## Why

MIT protocol compatibility lets permissive projects emit RuleOak evidence without linking the AGPL runtime. The runtime remains protected and commercially licensable.
