from src.models.state import EditorState
from langchain_core.messages import SystemMessage
from langgraph.graph import END

def should_continue(state: EditorState):
    last_msg = state.messages[-1]
    is_error = isinstance(last_msg, SystemMessage) and "Error:" in last_msg.content

    if is_error:
        if state.retry_count >= 3:
            return "fallback"
        return "retry"
    
    return END