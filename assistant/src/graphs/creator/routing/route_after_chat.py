from src.models.state import MainState
from langgraph.graph import END

def route_after_chat(state: MainState):
    trip = state.trip
    required = [trip.name, trip.description, trip.start_date, trip.end_date]
    if all(field is not None for field in required):
        return "list_generator"
    return END