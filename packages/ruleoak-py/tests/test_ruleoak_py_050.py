from pathlib import Path
import tempfile
from ruleoak_py import FlightRecorder, validate_evidence_jsonl_text, read_evidence_jsonl


def test_flight_recorder_writes_ruleoak_agentic_evidence_jsonl():
    recorder = FlightRecorder(run_id="py-run", session_id="py-session", actor="py-agent")
    recorder.record("run_started", {"title": "Python bridge"})
    recorder.record("action_requested", {"toolName": "search_docs", "api_key": "sk-demo-secret-123456"})
    recorder.record("run_finished", {"status": "ok"})
    text = recorder.to_jsonl()
    result = validate_evidence_jsonl_text(text)
    assert result["ok"], result
    assert result["events"][1]["payload"]["api_key"] == "[REDACTED]"


def test_round_trip_file_read():
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "evidence.jsonl"
        recorder = FlightRecorder(run_id="py-run", session_id="py-session")
        recorder.record("run_started", {})
        recorder.write_jsonl(path)
        events = read_evidence_jsonl(path)
        assert events[0]["schemaVersion"] == "ruleoak.agentic.evidence.v1"


if __name__ == "__main__":
    test_flight_recorder_writes_ruleoak_agentic_evidence_jsonl()
    test_round_trip_file_read()
    print("ruleoak-py v0.5.0 tests passed")
