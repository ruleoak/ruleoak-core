from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
import json
import re
import uuid

EVIDENCE_SCHEMA_VERSION = "ruleoak.agentic.evidence.v1"
MANIFEST_SCHEMA_VERSION = "ruleoak.manifest.v1"
SECRET_KEY_RE = re.compile(r"(api[_-]?key|token|secret|password|passwd|authorization|cookie|bearer|private[_-]?key)", re.I)
SECRET_VALUE_RE = re.compile(r"(sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+|-----BEGIN [A-Z ]*PRIVATE KEY-----)")
REDACTED = "[REDACTED]"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def redact_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): (REDACTED if SECRET_KEY_RE.search(str(k)) else redact_value(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [redact_value(v) for v in value]
    if isinstance(value, str) and SECRET_VALUE_RE.search(value):
        return REDACTED
    return value


@dataclass
class EvidenceEvent:
    schemaVersion: str
    eventId: str
    runId: str
    sessionId: str
    sequence: int
    type: str
    timestamp: str
    actor: str
    payload: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FlightRecorder:
    def __init__(self, run_id: Optional[str] = None, session_id: Optional[str] = None, actor: str = "agent") -> None:
        self.run_id = run_id or f"roak-run-{uuid.uuid4()}"
        self.session_id = session_id or f"roak-session-{uuid.uuid4()}"
        self.actor = actor
        self.sequence = 0
        self.events: List[EvidenceEvent] = []

    def record(self, event_type: str, payload: Optional[Dict[str, Any]] = None) -> EvidenceEvent:
        if not event_type:
            raise ValueError("event_type is required")
        self.sequence += 1
        event = EvidenceEvent(
            schemaVersion=EVIDENCE_SCHEMA_VERSION,
            eventId=f"evt-{self.sequence:06d}",
            runId=self.run_id,
            sessionId=self.session_id,
            sequence=self.sequence,
            type=event_type,
            timestamp=_now(),
            actor=self.actor,
            payload=redact_value(payload or {}),
        )
        self.events.append(event)
        return event

    def start_run(self, payload: Optional[Dict[str, Any]] = None) -> EvidenceEvent:
        return self.record("run_started", payload or {})

    def finish_run(self, payload: Optional[Dict[str, Any]] = None) -> EvidenceEvent:
        return self.record("run_finished", payload or {})

    def to_jsonl(self) -> str:
        return "".join(json.dumps(event.to_dict(), separators=(",", ":")) + "\n" for event in self.events)

    def write_jsonl(self, path: str | Path) -> None:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(self.to_jsonl(), encoding="utf-8")


class EvidenceValidator:
    def validate_event(self, event: Dict[str, Any]) -> List[str]:
        return validate_evidence_event(event)

    def validate_jsonl_text(self, text: str) -> Dict[str, Any]:
        return validate_evidence_jsonl_text(text)


class EvidenceReader:
    def read_jsonl(self, path: str | Path) -> List[Dict[str, Any]]:
        return read_evidence_jsonl(path)


def validate_evidence_event(event: Dict[str, Any]) -> List[str]:
    errors: List[str] = []
    required = ["schemaVersion", "eventId", "runId", "sessionId", "sequence", "type", "timestamp", "actor", "payload"]
    for field in required:
        if field not in event:
            errors.append(f"missing required field: {field}")
    if event.get("schemaVersion") != EVIDENCE_SCHEMA_VERSION:
        errors.append("schemaVersion must be ruleoak.agentic.evidence.v1")
    if not isinstance(event.get("sequence"), int) or event.get("sequence", -1) < 0:
        errors.append("sequence must be a non-negative integer")
    if "payload" in event and not isinstance(event.get("payload"), dict):
        errors.append("payload must be an object")
    return errors


def validate_evidence_jsonl_text(text: str) -> Dict[str, Any]:
    events: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []
    for idx, line in enumerate([ln.strip() for ln in text.splitlines() if ln.strip()], start=1):
        try:
            event = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append({"line": idx, "errors": [f"invalid JSON: {exc}"]})
            continue
        event_errors = validate_evidence_event(event)
        if event_errors:
            errors.append({"line": idx, "errors": event_errors})
        events.append(event)
    return {"ok": not errors, "events": events, "errors": errors, "lineCount": len(events)}


def read_evidence_jsonl(path: str | Path) -> List[Dict[str, Any]]:
    text = Path(path).read_text(encoding="utf-8")
    result = validate_evidence_jsonl_text(text)
    if not result["ok"]:
        raise ValueError(f"invalid evidence jsonl: {result['errors']}")
    return result["events"]


def validate_ruleoak_manifest(manifest: Dict[str, Any]) -> Dict[str, Any]:
    errors: List[str] = []
    if manifest.get("version") != MANIFEST_SCHEMA_VERSION:
        errors.append("version must be ruleoak.manifest.v1")
    if not manifest.get("project", {}).get("name"):
        errors.append("project.name is required")
    if not manifest.get("agent", {}).get("name"):
        errors.append("agent.name is required")
    evidence = manifest.get("evidence", {})
    if evidence.get("enabled", True) and evidence.get("format", "jsonl") != "jsonl":
        errors.append("evidence.format must be jsonl")
    allowed = manifest.get("permissions", {}).get("allowedActions", [])
    if any(str(x).strip() in {"*", "all", "everything"} for x in allowed):
        errors.append("permissions.allowedActions must not broadly allow all actions")
    return {"ok": not errors, "errors": errors, "manifest": manifest}
