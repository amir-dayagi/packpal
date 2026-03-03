from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from src.models.item import Item, items_reducer

class Category(BaseModel):
    id: Optional[int] = None
    name: str = ""
    items: List[Item] = []

def categories_reducer(curr_categories: List[Category], action: Dict[str, Any]) -> List[Category]:
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
    try:
        categories = [Category.model_validate(category) for category in action]
        return categories
    except Exception:
        if action["type"] == "add":
            curr_categories.append(action["category"])
        elif action["type"] == "update_name":
            for category in curr_categories:
                if category.name == action["category_name"]:
                    category.name = action["new_name"]
                    break
        elif action["type"] == "items_action":
            for category in curr_categories:
                if category.name == action["category_name"]:
                    category.items = items_reducer(category.items, action["items_action"])
                    break
        elif action["type"] == "delete":
            curr_categories = [category for category in curr_categories if category.name != action["category_name"]]
        elif action["type"] == "batch":
            for sub_action in action["actions"]:
                curr_categories = categories_reducer(curr_categories, sub_action)
        return curr_categories