# OpenClaw-style upstream PR strategy

Do not open with “OpenClaw is unsafe.” Open with “optional permission and evidence integration pattern.”

## Preferred PR shape

1. Add optional evidence emission hooks.
2. Add documentation for external action firewall integration.
3. Add example policy for dangerous tools.

## Avoid

- hard dependency on AGPL RuleOak Core
- exploit-level public detail
- claims that RuleOak provides certification

## Good PR sentence

This PR proposes an optional permission/evidence integration pattern so users can review high-risk actions before execution and keep replayable action evidence.
