from ruleoak_py.integrations import openai_agents, crewai, autogen, llamaindex, semantic_kernel


def test_optional_wrappers_mock():
    for mod in [openai_agents, crewai, autogen, llamaindex, semantic_kernel]:
        wrapped = mod.wrap_tool(lambda x=1: {"x": x}, tool_name="demo")
        assert wrapped()["x"] == 1
        assert "action_executed" in wrapped.ruleoak_recorder.to_jsonl()
