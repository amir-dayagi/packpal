from langgraph.graph import StateGraph, END

from assistant.models.state import State

from assistant.graphs.creator.nodes.chat_node import create_chat_node
from assistant.graphs.creator.nodes.extraction_node import create_extraction_node
from assistant.graphs.creator.nodes.list_generator_node import create_list_generator_node

from assistant.graphs.creator.routing_functions.list_generation_condition import list_generation_condition

def create_creator_graph():
    graph_builder = StateGraph(State)
    
    extraction_node = create_extraction_node()
    chat_node = create_chat_node()
    list_generator_node = create_list_generator_node()

    graph_builder.add_node("extraction", extraction_node)
    graph_builder.add_node("chat", chat_node)
    graph_builder.add_node("list_generator", list_generator_node)
    
    graph_builder.set_entry_point("extraction")
    graph_builder.add_edge("extraction", "chat")
    graph_builder.add_conditional_edges(
        "chat", 
        list_generation_condition,
        {
            "list_generator": "list_generator",
            "end": END,
        }
    )
    graph_builder.add_edge("list_generator", END)
    
    return graph_builder.compile()
    