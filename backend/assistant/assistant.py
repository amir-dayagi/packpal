from assistant.graphs.assistant.assistant_graph import assistant_graph_builder
from assistant.models.state import State
from assistant.models.trip import Trip
from assistant.models.category import Category
from assistant.models.item import Item
from typing import List
from langgraph.checkpoint.base import BaseCheckpointSaver
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph

def get_assistant_graph(checkpointer: BaseCheckpointSaver):
    assistant_graph = assistant_graph_builder.compile(checkpointer=checkpointer)
    return assistant_graph

def start_assistant(
    assistant_graph: StateGraph, 
    config: dict,
    trip: Trip = Trip(),
    categories: List[Category] = [],
    uncategorized_items: List[Item] = [],
):
    """Start the assistant for the current user
    
    Args:
        assistant_graph: The assistant graph
        config: The graph configuration
        trip: The trip to start the assistant for
        categories: The categories for the trip
        uncategorized_items: The uncategorized items for the trip
    
    Returns:
        {
            "greeting_message": str,
            "trip": Trip,
            "categories": List[Category],
            "uncategorized_items": List[Item]
        }
    """
    initial_state = assistant_graph.get_state(config)
    if initial_state.values.get("messages"):
        raise ValueError("Assistant is already running.")
    
    response = assistant_graph.invoke({
        "trip": trip,
        "categories": categories,
        "uncategorized_items": uncategorized_items
    }, config)

    return {
        "greeting_message": response["messages"][-1].content,
        "trip": response["trip"],
        "categories": response["categories"],
        "uncategorized_items": response["uncategorized_items"]
    }

def call_assistant(
    assistant_graph: StateGraph, 
    config: dict, 
    user_msg: str, 
    trip: Trip = Trip(), 
    categories: List[Category] = [], 
    uncategorized_items: List[Item] = [], 
):
    """Call the assistant for the current user
    
    Args:
        assistant_graph: The assistant graph
        config: The graph configuration
        user_msg: The user message
        trip: The current trip
        categories: The current categories
        uncategorized_items: The current uncategorized items
    
    Returns:
        (
            mode: messages | values,
            content: str | {
                "trip": Trip,
                "categories": List[Category],
                "uncategorized_items": List[Item]
            }
        )
    """
    if not user_msg:
        raise ValueError("User message is required.")
    
    message_nodes = ["chat", "list_generator", "transition"]
    for namespace, mode, chunk in assistant_graph.stream({
        "messages": [user_msg],
        "trip": trip,
        "categories": categories,
        "uncategorized_items": uncategorized_items
    }, config, stream_mode=["values", "messages"], subgraphs=True):
        # Only yield values from the main graph to limit the intermediate values from subgraphs
        if mode == "values" and not namespace:
            yield mode, {
                "trip": chunk["trip"],
                "categories": chunk["categories"],
                "uncategorized_items": chunk["uncategorized_items"]
            }
        elif mode == "messages":
            msg, metadata = chunk
            # Only yield messages from the chat nodes
            if metadata["langgraph_node"] in message_nodes:
                yield mode, msg.content

def add_system_message(assistant_graph: StateGraph, config: dict, system_msg: str):
    assistant_graph.update_state(config, {"messages": [SystemMessage(content=system_msg)]})
