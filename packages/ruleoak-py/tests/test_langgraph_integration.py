from ruleoak_py.integrations.langgraph import ruleoak_guarded_node


def test_langgraph_guarded_node_mock():
    def node(state):
        return {**state, "ok": True}
    wrapped = ruleoak_guarded_node(node)
    result = wrapped({"x": 1})
    assert result["ok"] is True
    assert "action_executed" in wrapped.ruleoak_recorder.to_jsonl()
