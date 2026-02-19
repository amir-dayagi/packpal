from assistant.models.state import State

def transition_condition(state: State):
    if state.trip.name and state.trip.description and state.trip.start_date and state.trip.end_date:
        return "transition"
    return "end"