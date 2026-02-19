from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition

from assistant.models.state import State
from assistant.graphs.editor.nodes.chat_node import create_chat_node

from assistant.graphs.tools.trip import trip_tools
from assistant.graphs.tools.item import item_tools
from assistant.graphs.tools.category import category_tools

def create_editor_graph():
    graph_builder = StateGraph(State)
    
    tools = [*trip_tools, *item_tools, *category_tools]
    chat_node = create_chat_node(tools)
    tool_node = ToolNode(tools)

    graph_builder.add_node("chat", chat_node)
    graph_builder.add_node("tools", tool_node)

    graph_builder.set_entry_point("chat")
    graph_builder.add_conditional_edges(
        "chat",
        tools_condition,
        {
            "tools": "tools",
            END: END
        }
    )
    graph_builder.add_edge("tools", "chat")

    return graph_builder.compile()
    