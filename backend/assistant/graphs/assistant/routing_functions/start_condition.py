from assistant.models.state import State

def start_condition(state: State):
    if not state.messages:
        return "greeting"
    if state.trip.name and state.trip.start_date and state.trip.end_date:
        return "editor"
    return "creator"