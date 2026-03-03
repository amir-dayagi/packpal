from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any
from datetime import date

class Trip(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def handle_serialized_dates(cls, v: Any) -> Any:
        if isinstance(v, list) and len(v) == 3:
            return date(int(v[0]), int(v[1]), int(v[2]))
        if isinstance(v, str):
            from datetime import datetime
            return datetime.strptime(v.split("T")[0], "%Y-%m-%d").date()
        return v

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
    try:
        trip = Trip.model_validate(action)
        return trip
    except Exception:
        if action["type"] == "update_name":
            curr_trip.name = action["new_name"]
        elif action["type"] == "update_description":
            curr_trip.description = action["new_description"]
        elif action["type"] == "update_dates":
            curr_trip.start_date = action["new_start_date"]
            curr_trip.end_date = action["new_end_date"]
        return curr_trip