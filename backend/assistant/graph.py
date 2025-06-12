from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Optional, List, Dict, Any, Generator

from assistant.models.state import State
from assistant.models.trip import Trip
from assistant.models.item import Item
from assistant.models.chat import ChatMessage

from assistant.tools.trip import trip_tools
from assistant.tools.items import items_tools

from assistant.nodes.chatbot import create_chatbot_node

from assistant.system_prompt import system_prompt


# --- Create Graph ---
assistant_graph_builder = StateGraph(State)

# --- Create Nodes ---
tools = [*trip_tools, *items_tools]
chatbot_node = create_chatbot_node(tools)
tool_node = ToolNode(tools)

# --- Add Nodes ---
assistant_graph_builder.add_node("chatbot", chatbot_node)
assistant_graph_builder.add_node("tools", tool_node)


# --- Set Entry Point ---
assistant_graph_builder.set_entry_point("chatbot")

# --- Add Edges ---
assistant_graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
    {
        "tools": "tools",
        END: END,
    },
)
assistant_graph_builder.add_edge("tools", "chatbot")


def call_assistant(assistant_graph: StateGraph, user_msg: str, trip: Trip, packing_list: Optional[List[Item]] = []) -> Generator[Dict[str, Any], None, None]:
    trip = Trip.model_validate(trip)
    packing_list = [Item.model_validate(item) for item in packing_list]
    
    if not user_msg:
        raise ValueError("User message is required.")
    
    config = {"configurable": {"thread_id": trip.id}}
    initial_state = assistant_graph.get_state(config).values

    messages = [] 
    # Inject the system prompt if the trip is new
    if not initial_state:
        messages.append(SystemMessage(system_prompt))
    # Add the user message
    messages.append(HumanMessage(user_msg))

    # Add the chat history
    chat_history = [ChatMessage(role="user", content=user_msg)]
    
    for chunk in assistant_graph.stream({
        "messages": messages,
        "chat_history": chat_history,
        "trip": {"type": "set", "trip": trip},
        "packing_list": {"type": "set", "items": packing_list}
    }, config, stream_mode="values"):
        yield chunk