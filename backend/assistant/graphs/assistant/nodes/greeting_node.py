from assistant.models.state import State
from langchain_core.messages import AIMessage

def greeting_node(state: State):
    if state.messages:
        return {}
    
    if state.trip.name:
        return {"messages": [AIMessage(content=f"Welcome back! I've got your {state.trip.name} list ready to go. ✈️\n\nNeed to add some gear, adjust for the weather, or change your dates? Just let me know what's up!")]}
    
    return {"messages": [AIMessage(content="Hi there! I'm PackPal, your personal packing pro. 🌍 Where are we heading?\n\nTell me a bit about your destination and when you're leaving, and I'll handle the checklist!")]}