# Python SDK Bridge

RuleOak Core v1.0 is the canonical governed AI runtime. The companion Python SDK, `ruleoak-py`, lets Python applications emit RuleOak Core v1.0-compatible governance records without embedding the TypeScript runtime.

Use the Python SDK when the vertical application is already written in Python and needs a clean governance trail around automated work:

- run records
- evidence records
- policy decisions
- approval records
- audit events
- report records
- domain-pack metadata

## Positioning

`ruleoak-py` is a bridge, not a replacement for RuleOak Core.

| Layer | Role |
|---|---|
| RuleOak Core v1.0 | Canonical governed runtime and policy/sandbox foundation |
| ruleoak-py v0.1.0 | Python SDK for RuleOak-compatible governance records |
| Vertical app | Performs domain work and calls the SDK at governance boundaries |

## Typical integration pattern

A Python application should call the SDK before and after meaningful actions:

1. Start a governed run.
2. Evaluate policy for the proposed action.
3. Record evidence for the recommendation or action.
4. Request or record approval when needed.
5. Append audit events.
6. Write a report record.

The application remains responsible for its own domain logic. RuleOak records the governance trail around that work.

## Generic sample

See:

```text
examples/python-bridge/generic_bridge_sample.py
```

The sample writes RuleOak-compatible local records and optionally imports a local RuleOak Core JavaScript runtime if `RULEOAK_CORE_PATH` is set.

```bash
python -m pip install -e ../ruleoak-py
python examples/python-bridge/generic_bridge_sample.py

# Optional local RuleOak Core smoke test
export RULEOAK_CORE_PATH=/path/to/ruleoak-core
python examples/python-bridge/generic_bridge_sample.py
```

The optional smoke test is local only. It does not download packages and does not call the network.

## Release boundary

The Python SDK starts at `0.1.0` because it is a new SDK surface. Its record protocol is compatible with RuleOak Core v1.0. Keep this distinction clear:

- RuleOak Core: v1.0
- ruleoak-py: v0.1.0
- Record compatibility: RuleOak Core v1.0

## Public communication

When describing the SDK publicly, use this sentence:

> ruleoak-py is a Python SDK for emitting RuleOak Core v1.0-compatible governance records from Python vertical applications.

Avoid describing it as a full Python port or as a sandbox.
