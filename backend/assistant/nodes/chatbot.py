from langchain_core.tools import Tool
from typing import List
from langchain.chat_models import init_chat_model
import os
from langchain_core.messages import HumanMessage

from assistant.models.state import State
from assistant.models.chat import ChatMessage

def create_chatbot_node(tools: List[Tool]):
    llm = init_chat_model(os.environ["GOOGLE_GENAI_API_KEY"])

    llm_with_tools = llm.bind_tools(tools)

    def chatbot_node(state: State):
        if isinstance(state.messages[-1], HumanMessage):
            state.messages[-1].content = f"""
Trip: {state.trip.model_dump_json()}

Packing List: [{",\n".join([item.model_dump_json() for item in state.packing_list])}]

User message: {state.messages[-1].content}
"""
        response = llm_with_tools.invoke(state.messages)
        
        return {"messages": [response], "chat_history": [ChatMessage(role="assistant", content=response.content)]}

    return chatbot_node
