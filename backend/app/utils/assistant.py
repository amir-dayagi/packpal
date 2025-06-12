from langgraph.checkpoint.postgres import PostgresSaver
from typing import List, Dict, Any, Generator
from app.models.assistant import AssistantChatMessage, AssistantStreamResponse, AssistantChatRequest
from assistant.graph import assistant_graph_builder, call_assistant
from psycopg_pool import ConnectionPool
from langchain_core.messages import ToolMessage, HumanMessage, AIMessage

def get_chat_history(trip_id: str, connection_pool: ConnectionPool) -> List[AssistantChatMessage]:
    """
    Get the assistant chat history for a trip
    """
    with connection_pool.connection() as conn:
        memory = PostgresSaver(conn)
        assistant_graph = assistant_graph_builder.compile(checkpointer=memory)
        state = assistant_graph.get_state({"configurable": {"thread_id": trip_id}}).values
        if not state or not state['chat_history']:
            return []
        return [AssistantChatMessage(**message.model_dump()) for message in state['chat_history']]
    
def chat_with_assistant(request: AssistantChatRequest, connection_pool: ConnectionPool) -> Generator[AssistantStreamResponse, None, None]:
    """
    Chat with the assistant
    """
    with connection_pool.connection() as conn:
        memory = PostgresSaver(conn)
        assistant_graph = assistant_graph_builder.compile(checkpointer=memory)
        trip = request.trip.model_dump()
        packing_list = [item.model_dump() for item in request.packing_list]
        for chunk in call_assistant(assistant_graph, request.message, trip, packing_list):
            role = None
            if isinstance(chunk['messages'][-1], ToolMessage):
                role = 'tool'
            elif isinstance(chunk['messages'][-1], HumanMessage):
                role = 'user'
            elif isinstance(chunk['messages'][-1], AIMessage):
                role = 'assistant'
            yield AssistantStreamResponse(
                message=AssistantChatMessage(
                    role=role,
                    content=chunk['messages'][-1].content
                ),
                trip=chunk['trip'].model_dump(),
                packing_list=[item.model_dump() for item in chunk['packing_list']]
            )

        