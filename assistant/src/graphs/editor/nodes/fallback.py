from src.models.state import EditorState
from src.utils.llm import get_llm
from langchain_core.messages import AIMessage, SystemMessage

llm = get_llm()

async def fallback_node(state: EditorState):
    last_error = state.messages[-1].content
    
    prompt = f"""
    You are PackPal. You tried to update the packing list but encountered an error you couldn't fix: {last_error}.
    
    Acknowledge the difficulty, tell the user what you were TRYING to do,
    and ask them to clarify or provide the information in a different way.
    """
    
    response = await llm.ainvoke([SystemMessage(content=prompt), *state.messages]) 
    
    return {
        "messages": [AIMessage(content=response.content)],
        "retry_count": 0
    }