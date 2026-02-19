from assistant.models.state import State
from langchain_core.messages import AIMessage

def transition_node(state: State):
    return {"messages": [AIMessage(content="\n\nI can tweak quantities, add specific items, or even suggest gear if you tell me more about your plans (like if you're hitting any fancy dinners or expected rain)!")]}