# ruleoak-py v1.0.0

Python bridge for RuleOak Evidence JSONL v1, manifest validation, and local Flight Recorder workflows.

## Install locally

```bash
pip install -e .
```

## Quickstart

```bash
python -m ruleoak_py.cli quickstart
python -m ruleoak_py.examples.quickstart
```

## API

```python
from ruleoak_py import FlightRecorder, validate_evidence_jsonl_text

recorder = FlightRecorder(run_id="demo")
recorder.start_run({"purpose": "demo"})
recorder.record("action_requested", {"toolName": "search", "operation": "read"})
recorder.finish_run({"ok": True})
assert validate_evidence_jsonl_text(recorder.to_jsonl())["ok"]
```

## License

Runtime bridge code is AGPL-3.0-or-later with commercial licensing available. Protocol fixtures/schemas may be MIT where marked.
