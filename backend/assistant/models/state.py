from pydantic import BaseModel
from typing import Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from assistant.models.trip import Trip
from assistant.models.item import Item
from assistant.models.chat import ChatMessage

def packing_list_reducer(curr_list: List[Item], action: Dict[str, Any]) -> List[Item]:
    """
    Reduces a single action (set, add, update_quantity, update_notes, delete) onto the current packing list.

    Args:
        curr_list: The current list of items in the packing list.
        action: A dictionary specifying the action to be applied.
                Example actions:
                {'type': 'set', 'items': [Item(name='sunscreen', quantity=1, notes=''), Item(name='hat', quantity=1, notes='')]
                {'type': 'add', 'item': Item(name='sunscreen', quantity=1, notes='')}
                {'type': 'update_quantity', 'item_name': 'sunscreen', 'new_quantity': 2}
                {'type': 'update_notes', 'item_name': 'sunscreen', 'new_notes': 'Apply liberally'}
                {'type': 'delete', 'item_name': 'sunscreen'}
    Returns:
        A new list with the action applied.
    """
    if action["type"] == "set":
        curr_list = action["items"]
    elif action["type"] == "add":
        curr_list.append(action["item"])
    elif action["type"] == "update_quantity":
        for item in curr_list:
            if item.name == action["item_name"]:
                item.quantity = action["new_quantity"]
                break
    elif action["type"] == "update_notes":
        for item in curr_list:
            if item.name == action["item_name"]:
                item.notes = action["new_notes"]
                break
    elif action["type"] == "delete":
        curr_list = [item for item in curr_list if item.name != action["item_name"]]
    return curr_list

def trip_reducer(curr_trip: Trip, action: Dict[str, Any]) -> Trip:
    """
    Reduces a single action (set, update_name, update_description, update_dates) onto the current trip.
    Args:
        curr_trip: The current trip.
        action: A dictionary specifying the action to be applied.
                Example actions:
                {'type': 'set', 'trip': Trip(name='Trip to the beach', description='A trip to the beach', start_date='2025-01-01', end_date='2025-01-03')}
                {'type': 'update_name', 'new_name': 'Trip to the mountains'}
                {'type': 'update_description', 'new_description': 'A trip to the mountains'}
                {'type': 'update_dates', 'new_start_date': '2025-01-01', 'new_end_date': '2025-01-03'}
    
    Returns:
        A new trip with the action applied.
    """
    if action["type"] == "set":
        curr_trip = action["trip"]
    elif action["type"] == "update_name":
        curr_trip.name = action["new_name"]
    elif action["type"] == "update_description":
        curr_trip.description = action["new_description"]
    elif action["type"] == "update_dates":
        curr_trip.start_date = action["new_start_date"]
        curr_trip.end_date = action["new_end_date"]
    return curr_trip


class State(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages] = []
    chat_history: Annotated[List[ChatMessage], lambda curr_history, new_chats: curr_history + new_chats] = []
    trip: Annotated[Trip, trip_reducer] = Trip()
    packing_list: Annotated[List[Item], packing_list_reducer] = []