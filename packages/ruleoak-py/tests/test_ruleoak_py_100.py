from pathlib import Path
from ruleoak_py import FlightRecorder, validate_evidence_jsonl_text, read_evidence_jsonl, validate_ruleoak_manifest, __version__


def test_version_and_recorder(tmp_path):
    assert __version__ == "1.0.0"
    recorder = FlightRecorder(run_id="py-test")
    recorder.start_run({"purpose": "test"})
    recorder.record("action_requested", {"toolName": "search", "operation": "read", "apiKey": "SECRET"})
    recorder.finish_run({"ok": True})
    text = recorder.to_jsonl()
    assert "SECRET" not in text
    result = validate_evidence_jsonl_text(text)
    assert result["ok"]
    path = tmp_path / "evidence.jsonl"
    recorder.write_jsonl(path)
    assert len(read_evidence_jsonl(path)) == 3


def test_manifest_validation():
    manifest = {
        "version": "ruleoak.manifest.v1",
        "project": {"name": "py"},
        "agent": {"name": "py-agent"},
        "permissions": {"allowedActions": ["search.read"], "blockedActions": ["filesystem.delete"]},
        "evidence": {"enabled": True, "format": "jsonl"},
        "redaction": {"enabled": True}
    }
    assert validate_ruleoak_manifest(manifest)["ok"]
