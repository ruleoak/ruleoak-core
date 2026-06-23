from ruleoak_py.integrations.langgraph import ruleoak_guarded_node


def node(state):
    return {**state, "ok": True}

wrapped = ruleoak_guarded_node(node)
print(wrapped({"task": "demo"}))
print(wrapped.ruleoak_recorder.to_jsonl())
