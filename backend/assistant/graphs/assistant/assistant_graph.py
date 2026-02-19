from langgraph.graph import StateGraph, END, START

from assistant.models.state import State

from assistant.graphs.creator.creator_graph import create_creator_graph
from assistant.graphs.editor.editor_graph import create_editor_graph
from assistant.graphs.assistant.nodes.greeting_node import greeting_node
from assistant.graphs.assistant.nodes.transition_node import transition_node
from assistant.graphs.assistant.routing_functions.start_condition import start_condition
from assistant.graphs.assistant.routing_functions.transition_condition import transition_condition

def create_assistant_graph_builder():
    graph_builder = StateGraph(State)
    
    creator_graph = create_creator_graph()
    editor_graph = create_editor_graph()

    graph_builder.add_node("greeting", greeting_node)
    graph_builder.add_node("creator", creator_graph)
    graph_builder.add_node("transition", transition_node)
    graph_builder.add_node("editor", editor_graph)
    
    graph_builder.add_conditional_edges(
        START,
        start_condition,
        {
            "greeting": "greeting",
            "creator": "creator",
            "editor": "editor",
        },
    )
    graph_builder.add_edge("greeting", END)
    graph_builder.add_conditional_edges(
        "creator",
        transition_condition,
        {
            "transition": "transition",
            "end": END,
        },
    )
    graph_builder.add_edge("transition", END)
    graph_builder.add_edge("editor", END)
    
    return graph_builder

assistant_graph_builder = create_assistant_graph_builder()

    