from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

class Trip(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

def trip_reducer(curr_trip: Trip, action: Dict[str, Any]) -> Trip:
    """
    Reduces a single action (update_name, update_description, update_dates) onto the current trip.
    Passing a Trip object as the action will replace the current trip with the new trip. 
    Args:
        curr_trip: The current trip.
        action: A dictionary specifying the action to be applied.
                Example actions:
                {'type': 'update_name', 'new_name': 'Trip to the mountains'}
                {'type': 'update_description', 'new_description': 'A trip to the mountains'}
                {'type': 'update_dates', 'new_start_date': '2025-01-01', 'new_end_date': '2025-01-03'}
    
    Returns:
        A new trip with the action applied.
    """
    if isinstance(action, Trip):
        return action
    if action["type"] == "update_name":
        curr_trip.name = action["new_name"]
    elif action["type"] == "update_description":
        curr_trip.description = action["new_description"]
    elif action["type"] == "update_dates":
        curr_trip.start_date = action["new_start_date"]
        curr_trip.end_date = action["new_end_date"]
    return curr_trip