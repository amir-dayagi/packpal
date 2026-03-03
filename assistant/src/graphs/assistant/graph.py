from langgraph.graph import StateGraph, START, END

from src.graphs.creator.graph import creator_graph
from src.graphs.editor.graph import editor_graph
from src.graphs.assistant.nodes.greeting import greeting_node
from src.graphs.assistant.nodes.handoff import handoff_to_editor_node
from src.graphs.assistant.routing.route_entry_point import route_entry_point
from src.graphs.assistant.routing.route_after_creator import route_after_creator
from src.models.state import MainState

async def call_editor_node(state: MainState):
    res = await editor_graph.ainvoke({
        "messages": state.messages,
        "trip": state.trip,
        "categories": state.categories,
        "uncategorized_items": state.uncategorized_items,
        "retry_count": 0
    })
    return {
        "messages": res["messages"],
        "trip": res["trip"],
        "categories": res["categories"],
        "uncategorized_items": res["uncategorized_items"]
    }

workflow = StateGraph(MainState)
workflow.add_node("creator", creator_graph)
workflow.add_node("editor", call_editor_node)
workflow.add_node("greeting", greeting_node)
workflow.add_node("handoff", handoff_to_editor_node)


workflow.add_conditional_edges(
    START,
    route_entry_point,
    {
        "greeting": "greeting",
        "creator": "creator",
        "editor": "editor",
    }
)
workflow.add_edge("greeting", END)
workflow.add_edge("editor", END)
workflow.add_conditional_edges(
    "creator",
    route_after_creator,
    {
        "handoff": "handoff",
        END: END
    }
)
workflow.add_edge("handoff", END)

graph = workflow.compile()