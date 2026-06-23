from __future__ import annotations
from typing import Any, Callable, Dict
from ruleoak_py.agentic import FlightRecorder


def ruleoak_guarded_node(node: Callable[..., Any], recorder: FlightRecorder | None = None, node_name: str = "langgraph_node"):
    recorder = recorder or FlightRecorder(actor="langgraph")
    def wrapped(state: Dict[str, Any], *args: Any, **kwargs: Any):
        recorder.record("action_requested", {"toolName": node_name, "operation": "node.enter", "input": state})
        result = node(state, *args, **kwargs)
        recorder.record("action_executed", {"toolName": node_name, "operation": "node.exit", "output": result})
        return result
    wrapped.ruleoak_recorder = recorder
    return wrapped


def ruleoak_tool_wrapper(tool: Callable[..., Any], recorder: FlightRecorder | None = None, tool_name: str | None = None):
    recorder = recorder or FlightRecorder(actor="langgraph")
    name = tool_name or getattr(tool, "__name__", "langgraph_tool")
    def wrapped(*args: Any, **kwargs: Any):
        recorder.record("policy_decision", {"toolName": name, "decision": "allow", "reason": "mock-compatible wrapper"})
        result = tool(*args, **kwargs)
        recorder.record("action_executed", {"toolName": name, "result": result})
        return result
    wrapped.ruleoak_recorder = recorder
    return wrapped


def ruleoak_checkpoint_evidence(recorder: FlightRecorder, path):
    recorder.write_jsonl(path)
    return path
