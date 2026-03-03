from src.models.state import MainState
from langchain_core.messages import AIMessage

async def handoff_to_editor_node(state: MainState):
    handoff_message = (
        "Now, feel free to tell me to add things, change quantities, or move items around. "
        "What should we look at first?"
    )
    
    return {
        "messages": [AIMessage(content=handoff_message)]
    }