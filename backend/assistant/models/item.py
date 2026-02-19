from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Item(BaseModel):
    id: Optional[int] = None
    name: str = ""
    quantity: int = 0
    notes: Optional[str] = None


def item_reducer(curr_list: List[Item], action: Dict[str, Any]) -> List[Item]:
    """
    Reduces a single action (add, update_quantity, update_notes, update_category, delete) onto the current packing list.
    Passing a List[Item] as the action will replace the current list with the new list.

    Args:
        curr_list: The current list of items in the packing list.
        action: A dictionary specifying the action to be applied.
                Example actions:
                {'type': 'add', 'item': Item(name='sunscreen', quantity=1, notes='')}
                {'type': 'update_quantity', 'item_name': 'sunscreen', 'new_quantity': 2}
                {'type': 'update_notes', 'item_name': 'sunscreen', 'new_notes': 'Apply liberally'}
                {'type': 'delete', 'item_name': 'sunscreen'}
    Returns:
        A new list with the action applied.
    """
    if isinstance(action, list) and all(isinstance(item, Item) for item in action):
        return action
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