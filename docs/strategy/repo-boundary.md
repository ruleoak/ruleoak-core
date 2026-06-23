# Repository Boundary

## Public repositories

Use public repositories for developer adoption and interoperability:

- `ruleoak-core`: main AGPL/commercial runtime, docs, and safe demos.
- `ruleoak-protocol`: MIT schemas, evidence format, action envelope, badges, and fixtures.
- `ruleoak-py`, `ruleoak-adapters-ts`, `ruleoak-openclaw-adapter`, and `ruleoak-agentic-skills` only after their public APIs are stable.

## Private repositories

Keep productized applications private:

- `ruleoak-safedesk`.
- `safedesk-home-evidence` if later split.
- `safedesk-creator-proof` if later split.
- `safedesk-travel-proof` if later split.
- `safedesk-freelancer-proof` if later split.
- premium templates, signed installers, and customer/license code.

## Temporary private scaffold

If a private scaffold is stored inside this development workspace, it must not be included in npm artifacts or pushed to the public repo without sanitization.
