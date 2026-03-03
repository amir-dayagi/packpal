from langgraph.graph import StateGraph, START, END
from src.graphs.creator.nodes.chat import chat_node
from src.graphs.creator.nodes.list_generator import list_generator_node
from src.graphs.creator.routing.route_after_chat import route_after_chat
from src.models.state import MainState

workflow = StateGraph(MainState)
workflow.add_node("chat", chat_node)
workflow.add_node("list_generator", list_generator_node)
workflow.add_edge(START, "chat")
workflow.add_conditional_edges(
    "chat",
    route_after_chat,
    {
        "list_generator": "list_generator",
        END: END
    }
)
workflow.add_edge("list_generator", END)

creator_graph = workflow.compile()