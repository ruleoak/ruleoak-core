from __future__ import annotations
from typing import Any, Callable
from ruleoak_py.agentic import FlightRecorder


def wrap_tool(tool: Callable[..., Any], recorder: FlightRecorder | None = None, tool_name: str | None = None, dry_run: bool = False):
    recorder = recorder or FlightRecorder(actor="openai-agents")
    name = tool_name or getattr(tool, "__name__", "tool")
    def wrapped(*args: Any, **kwargs: Any):
        recorder.record("action_requested", {"toolName": name, "args": list(args), "kwargs": kwargs, "dryRun": dry_run})
        if dry_run:
            recorder.record("policy_decision", {"toolName": name, "decision": "dry_run_only"})
            return {"dryRunOnly": True, "toolName": name}
        recorder.record("policy_decision", {"toolName": name, "decision": "allow"})
        result = tool(*args, **kwargs)
        recorder.record("action_executed", {"toolName": name, "result": result})
        return result
    wrapped.ruleoak_recorder = recorder
    return wrapped
