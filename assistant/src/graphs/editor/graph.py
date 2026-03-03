from langgraph.graph import StateGraph, START, END
from src.graphs.editor.nodes.editor import editor_node
from src.graphs.editor.nodes.fallback import fallback_node
from src.graphs.editor.routing.should_continue import should_continue
from src.models.state import EditorState

workflow = StateGraph(EditorState)
workflow.add_node("editor", editor_node)
workflow.add_node("fallback", fallback_node)
workflow.add_edge(START, "editor")
workflow.add_conditional_edges(
    "editor",
    should_continue,
    {
        "retry": "editor",
        "fallback": "fallback",
        END: END
    }
)
workflow.add_edge("fallback", END)

editor_graph = workflow.compile()