from typing import Annotated, Optional
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from datetime import date

from assistant.models.state import State

@tool
def update_trip_name(tool_call_id: Annotated[str, InjectedToolCallId],
                     new_name: str) -> str:
    """
    Updates the name of the trip.
    Use this tool when the user's request requires a change in the trip name.
    This can be a new trip name, or a change in the trip name.
    You must provide the new name for the trip.
    Returns the new name of the trip if the name was updated, returns None if the name was not updated.
    """
    if not new_name:
        return "Trip name was not updated because no new name was provided."
    
    return Command(update= {
        "trip": {"type": "update_name", "new_name": new_name},
        "messages": [
            ToolMessage(
                f"Trip name was updated to: {new_name}",
                tool_call_id=tool_call_id
                )
        ]
    })

@tool
def update_trip_description(tool_call_id: Annotated[str, InjectedToolCallId],
                            new_description: str) -> str:
    """
    Updates the description of the trip.
    Use this tool when the user's request requires a change in the trip description.
    This can be a new description, or a change in the description.
    You must provide the new description for the trip.
    Returns the new description of the trip if the description was updated, returns None if the description was not updated.
    """
    if not new_description:
        return "Trip description was not updated because no new description was provided."
    
    return Command(update= {
        "trip": {"type": "update_description", "new_description": new_description},
        "messages": [
            ToolMessage(
                f"Trip description was updated to: {new_description}",
                tool_call_id=tool_call_id
                )
        ]
    })

@tool
def update_trip_dates(state: Annotated[State, InjectedState], 
                    tool_call_id: Annotated[str, InjectedToolCallId],
                    new_start_date: str,
                    new_end_date: str) -> str:
    """
    Updates either the start or end or both dates of the trip.
    Use this tool when the user's request requires a change in the trip start or end date.
    If you are updating both dates, you must provide both the new start date and the new end date.
    If you are updating only one date, you can provide an empty string for the other date.
    The date should be a string in the format YYYY-MM-DD.
    Ensure that the start date is before the end date.
    Returns a message indicating the dates were updated.
    """
    if not new_start_date and not new_end_date:
        return "Trip dates were not updated because no new start or end date was provided."
    
    new_start_date = new_start_date if new_start_date else state.trip.start_date
    new_end_date = new_end_date if new_end_date else state.trip.end_date

    try:
        new_start_date_object = date.fromisoformat(new_start_date)
        new_end_date_object = date.fromisoformat(new_end_date)
        if new_start_date_object > new_end_date_object:
            return "Trip dates were not updated because the start date is after the end date."
    except ValueError:
        return "Trip dates were not updated because the start or end date is not a valid date."
    
    return Command(update= {
        "trip": {"type": "update_dates", "new_start_date": new_start_date, "new_end_date": new_end_date},
        "messages": [
            ToolMessage(
                f"Trip dates were updated to: {new_start_date} - {new_end_date}",
                tool_call_id=tool_call_id
                )
        ]
    })

trip_tools = [update_trip_name, update_trip_description, update_trip_dates]