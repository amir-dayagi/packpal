from src.models.state import MainState

def route_entry_point(state: MainState):
    if not state.messages:
        return "greeting"
    
    trip = state.trip
    required = [trip.name, trip.description, trip.start_date, trip.end_date]
    if all(field is not None for field in required):
        return "editor"
    return "creator"