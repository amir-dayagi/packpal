from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from assistant.models.item import Item, item_reducer

class Category(BaseModel):
    id: Optional[int] = None
    name: str = ""
    items: List[Item] = []

def category_reducer(curr_categories: List[Category], action: Dict[str, Any]) -> List[Category]:
    """
    Reduces a single action (add, update_name, items_action, delete, batch) onto the current categories.
    Passing a List[Category] as the action will replace the current list with the new list.
    Args:
        curr_categories: The current list of categories.
        action: A dictionary specifying the action to be applied.
                Example actions:
                {'type': 'add', 'category': Category(name='Clothing', items=[Item(name='socks', quantity=2, notes='')])}
                {'type': 'update_name', 'category_name': 'Clothing', 'new_name': 'Clothes'}
                {'type': 'items_action', 'category_name': 'Clothing', 'items_action': {'type': 'set', 'items': [Item(name='socks', quantity=2, notes=''), Item(name='underwear', quantity=2, notes='')]}}
                {'type': 'delete', 'category_name': 'Clothing'}
                {'type': 'batch', 'actions': [action1, action2, ...]}
    Returns:
        A new list of categories with the action applied.
    """
    if isinstance(action, list) and all(isinstance(item, Category) for item in action):
        return action
    elif action["type"] == "add":
        curr_categories.append(action["category"])
    elif action["type"] == "update_name":
        for category in curr_categories:
            if category.name == action["category_name"]:
                category.name = action["new_name"]
                break
    elif action["type"] == "items_action":
        for category in curr_categories:
            if category.name == action["category_name"]:
                category.items = item_reducer(category.items, action["items_action"])
                break
    elif action["type"] == "delete":
        curr_categories = [category for category in curr_categories if category.name != action["category_name"]]
    elif action["type"] == "batch":
        for sub_action in action["actions"]:
            curr_categories = category_reducer(curr_categories, sub_action)
    return curr_categories