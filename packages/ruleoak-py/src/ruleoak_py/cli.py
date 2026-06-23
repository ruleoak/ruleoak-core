from __future__ import annotations
import argparse
import json
from pathlib import Path
from .agentic import FlightRecorder, validate_evidence_jsonl_text, read_evidence_jsonl


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="ruleoak-py")
    sub = parser.add_subparsers(dest="cmd", required=True)
    val = sub.add_parser("validate-evidence")
    val.add_argument("path")
    sub.add_parser("quickstart")
    replay = sub.add_parser("replay")
    replay.add_argument("path")
    args = parser.parse_args(argv)
    if args.cmd == "quickstart":
        rec = FlightRecorder(run_id="py-quickstart")
        rec.start_run({"purpose": "quickstart"})
        rec.record("action_requested", {"toolName": "search", "operation": "read", "apiKey": "SHOULD_REDACT"})
        rec.record("policy_decision", {"decision": "allow", "risk": "low"})
        rec.finish_run({"ok": True})
        print(rec.to_jsonl(), end="")
        return 0
    if args.cmd == "validate-evidence":
        result = validate_evidence_jsonl_text(Path(args.path).read_text(encoding="utf-8"))
        print(json.dumps(result, indent=2))
        return 0 if result["ok"] else 1
    if args.cmd == "replay":
        for event in read_evidence_jsonl(args.path):
            print(f"{event['sequence']:03d} {event['type']} {event.get('payload', {})}")
        return 0
    return 2

if __name__ == "__main__":
    raise SystemExit(main())
