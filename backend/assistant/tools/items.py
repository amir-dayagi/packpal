from typing import Optional, Annotated
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langgraph.types import Command
from langchain_core.messages import ToolMessage

from assistant.models.item import Item
from assistant.models.state import State

@tool
def add_item_to_packing_list(state: Annotated[State, InjectedState], 
                             tool_call_id: Annotated[str, InjectedToolCallId],
                             item_name: str, quantity: int, notes: Optional[str] = None) -> str:
    """
    Adds a new item to the packing list.
    Use this tool when the user's request requires adding a specific item.
    You must provide the item's name, and quantity. Notes are optional.
    Returns a message indicating the item was added to the packing list.
    """
    if not item_name and not quantity:
        return "Item was not added to the packing list because no item name or quantity was provided."
    elif not item_name:
        return "Item was not added to the packing list because no item name was provided."
    elif not quantity:
        return "Item was not added to the packing list because no quantity was provided."
    
    new_item = Item(name=item_name, quantity=quantity, notes=notes)
    return Command(update= {
        "packing_list": {"type": "add", "item": new_item},
        "messages": [
            ToolMessage(
                f"Item was added to the packing list: {new_item}",
                tool_call_id=tool_call_id
                )
        ]
    })

@tool
def remove_item_from_packing_list(state: Annotated[State, InjectedState], 
                                  tool_call_id: Annotated[str, InjectedToolCallId],
                                  item_name: str) -> str:
    """
    Removes an item from the packing list.
    Use this tool when the user's request requires removing a specific item.
    You must provide the item's name.
    Returns a message indicating the item was removed from the packing list.
    """
    if not item_name:
        return "Item was not removed from the packing list because no item name was provided."
    
    if item_name not in [item.name for item in state.packing_list]:
        return "Item was not removed from the packing list because the item name was not found."
    
    return Command(update= {
        "packing_list": {"type": "delete", "item_name": item_name},
        "messages": [
            ToolMessage(
                f"Item was removed from the packing list: {item_name}",
                tool_call_id=tool_call_id
                )
        ]
    })

@tool
def update_item_quantity(state: Annotated[State, InjectedState], 
                         tool_call_id: Annotated[str, InjectedToolCallId],
                         item_name: str, new_quantity: int) -> str:
    """
    Updates the quantity of an item in the packing list.
    Use this tool when the user's request requires updating the quantity of a specific item.
    You must provide the item's name and the new quantity.
    Returns a message indicating the quantity was updated.
    """
    if not item_name and not new_quantity:
        return "Item quantity was not updated because no item name or quantity was provided."
    elif not item_name:
        return "Item quantity was not updated because no item name was provided."
    elif not new_quantity or new_quantity <= 0:
        return "Item quantity was not updated because no quantity was provided or the quantity was not a positive number."
    
    item = next((item for item in state.packing_list if item.name == item_name), None)
    if not item:
        return "Item quantity was not updated because the item name was not found."
    
    return Command(update= {
        "packing_list": {"type": "update_quantity", "item_name": item_name, "new_quantity": new_quantity},
        "messages": [
            ToolMessage(
                f"Item quantity was updated: {item_name} - {new_quantity}",
                tool_call_id=tool_call_id
                )
        ]
    })

@tool
def update_item_notes(state: Annotated[State, InjectedState], 
                      tool_call_id: Annotated[str, InjectedToolCallId],
                      item_name: str, new_notes: str) -> str:
    """
    Updates the notes of an item in the packing list.
    Use this tool when the user's request requires updating the notes of a specific item.
    You must provide the item's name and the new notes.
    Returns a message indicating the notes were updated.
    """
    if not item_name and not new_notes:
        return "Item notes were not updated because no item name or notes were provided."
    elif not item_name:
        return "Item notes were not updated because no item name was provided."
    elif not new_notes:
        return "Item notes were not updated because no notes were provided."
    
    item = next((item for item in state.packing_list if item.name == item_name), None)
    if not item:
        return "Item notes were not updated because the item name was not found."
    
    return Command(update= {
        "packing_list": {"type": "update_notes", "item_name": item_name, "new_notes": new_notes},
        "messages": [
            ToolMessage(
                f"Item notes were updated: {item_name} - {new_notes}",
                tool_call_id=tool_call_id
                )
        ]
    })

items_tools = [add_item_to_packing_list, remove_item_from_packing_list, update_item_quantity, update_item_notes]