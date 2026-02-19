from assistant.models.state import State

def list_generation_condition(state: State):
    if state.trip.name and state.trip.description and state.trip.start_date and state.trip.end_date:
        return "list_generator"
    return "end"