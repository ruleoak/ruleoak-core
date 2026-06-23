from ruleoak_py import FlightRecorder, validate_evidence_jsonl_text

recorder = FlightRecorder(run_id="py-example")
recorder.start_run({"example": "quickstart"})
recorder.record("action_requested", {"toolName": "search", "operation": "read", "token": "SHOULD_REDACT"})
recorder.record("policy_decision", {"decision": "allow", "risk": "low"})
recorder.finish_run({"ok": True})
text = recorder.to_jsonl()
assert validate_evidence_jsonl_text(text)["ok"]
print(text, end="")
