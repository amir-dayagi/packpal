from typing import Optional, Annotated
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langgraph.types import Command
from langchain_core.messages import ToolMessage

from assistant.models.item import Item
from assistant.models.state import State

@tool
def add_item_to_category(state: Annotated[State, InjectedState], 
                         tool_call_id: Annotated[str, InjectedToolCallId],
                         item_name: str, quantity: int, category_name: Optional[str] = None, notes: Optional[str] = None) -> str:
    """
    Adds a new item to a category or to the uncategorized list.
    If category_name is not provided, the item is added to the uncategorized list.
    """
    new_item = Item(name=item_name, quantity=quantity, notes=notes)
    
    if category_name:
        # Check if category exists
        category = next((c for c in state.categories if c.name == category_name), None)
        if not category:
            return f"Category '{category_name}' not found. Please create the category first or add to uncategorized items."
        
        return Command(update={
            "categories": {
                "type": "items_action",
                "category_name": category_name,
                "items_action": {"type": "add", "item": new_item}
            },
            "messages": [ToolMessage(f"Added {item_name} to category '{category_name}'.", tool_call_id=tool_call_id)]
        })
    else:
        return Command(update={
            "uncategorized_items": {"type": "add", "item": new_item},
            "messages": [ToolMessage(f"Added {item_name} to uncategorized items.", tool_call_id=tool_call_id)]
        })

@tool
def remove_item_from_category(state: Annotated[State, InjectedState],
                            tool_call_id: Annotated[str, InjectedToolCallId],
                            item_name: str, category_name: Optional[str] = None) -> str:
    """
    Removes an item from a category or from the uncategorized list.
    If category_name is not provided, attempts to remove from the uncategorized list.
    """
    if category_name:
        category = next((c for c in state.categories if c.name == category_name), None)
        if not category:
            return f"Category '{category_name}' not found."
        
        item = next((i for i in category.items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in category '{category_name}'."
            
        return Command(update={
            "categories": {
                "type": "items_action",
                "category_name": category_name,
                "items_action": {"type": "delete", "item_name": item_name}
            },
            "messages": [ToolMessage(f"Removed {item_name} from category '{category_name}'.", tool_call_id=tool_call_id)]
        })
    else:
        item = next((i for i in state.uncategorized_items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in uncategorized items."
            
        return Command(update={
            "uncategorized_items": {"type": "delete", "item_name": item_name},
            "messages": [ToolMessage(f"Removed {item_name} from uncategorized items.", tool_call_id=tool_call_id)]
        })

@tool
def update_item_quantity(state: Annotated[State, InjectedState],
                       tool_call_id: Annotated[str, InjectedToolCallId],
                       item_name: str, new_quantity: int, category_name: Optional[str] = None) -> str:
    """
    Updates the quantity of an item.
    If category_name is not provided, searches in uncategorized items.
    """
    if category_name:
        category = next((c for c in state.categories if c.name == category_name), None)
        if not category:
            return f"Category '{category_name}' not found."
        
        item = next((i for i in category.items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in category '{category_name}'."
            
        return Command(update={
            "categories": {
                "type": "items_action",
                "category_name": category_name,
                "items_action": {"type": "update_quantity", "item_name": item_name, "new_quantity": new_quantity}
            },
            "messages": [ToolMessage(f"Updated quantity for {item_name} in '{category_name}' to {new_quantity}.", tool_call_id=tool_call_id)]
        })
    else:
        item = next((i for i in state.uncategorized_items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in uncategorized items."
            
        return Command(update={
            "uncategorized_items": {"type": "update_quantity", "item_name": item_name, "new_quantity": new_quantity},
            "messages": [ToolMessage(f"Updated quantity for {item_name} in uncategorized items to {new_quantity}.", tool_call_id=tool_call_id)]
        })

@tool
def update_item_notes(state: Annotated[State, InjectedState],
                    tool_call_id: Annotated[str, InjectedToolCallId],
                    item_name: str, new_notes: str, category_name: Optional[str] = None) -> str:
    """
    Updates the notes of an item.
    If category_name is not provided, searches in uncategorized items.
    """
    if category_name:
        category = next((c for c in state.categories if c.name == category_name), None)
        if not category:
            return f"Category '{category_name}' not found."
        
        item = next((i for i in category.items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in category '{category_name}'."
            
        return Command(update={
            "categories": {
                "type": "items_action",
                "category_name": category_name,
                "items_action": {"type": "update_notes", "item_name": item_name, "new_notes": new_notes}
            },
            "messages": [ToolMessage(f"Updated notes for {item_name} in '{category_name}'.", tool_call_id=tool_call_id)]
        })
    else:
        item = next((i for i in state.uncategorized_items if i.name == item_name), None)
        if not item:
            return f"Item '{item_name}' not found in uncategorized items."
            
        return Command(update={
            "uncategorized_items": {"type": "update_notes", "item_name": item_name, "new_notes": new_notes},
            "messages": [ToolMessage(f"Updated notes for {item_name} in uncategorized items.", tool_call_id=tool_call_id)]
        })

@tool
def update_item_category(state: Annotated[State, InjectedState],
                       tool_call_id: Annotated[str, InjectedToolCallId],
                       item_name: str, new_category_name: Optional[str] = None, current_category_name: Optional[str] = None) -> str:
    """
    Moves an item from one category to another (or to/from uncategorized).
    
    Args:
        item_name: The name of the item to move.
        new_category_name: The destination category. If None, moves to uncategorized.
        current_category_name: The source category. If None, assumes item is currently uncategorized.
    """
    # 1. Locate the item in the source
    item = None
    if current_category_name:
        source_category = next((c for c in state.categories if c.name == current_category_name), None)
        if not source_category:
            return f"Source category '{current_category_name}' not found."
        item = next((i for i in source_category.items if i.name == item_name), None)
    else:
        # Source is uncategorized
        item = next((i for i in state.uncategorized_items if i.name == item_name), None)
    
    if not item:
        source_desc = f"category '{current_category_name}'" if current_category_name else "uncategorized items"
        return f"Item '{item_name}' not found in {source_desc}."

    # 2. Verify destination category exists if specified
    if new_category_name:
        dest_category = next((c for c in state.categories if c.name == new_category_name), None)
        if not dest_category:
            return f"Destination category '{new_category_name}' not found."

    # 3. Construct update commands
    updates = {}
    
    # Remove from source
    if current_category_name:
        # Removing from a category
        if "categories" not in updates:
            updates["categories"] = {"type": "batch", "actions": []}
        
        updates["categories"]["actions"].append({
            "type": "items_action",
            "category_name": current_category_name,
            "items_action": {"type": "delete", "item_name": item_name}
        })
    else:
        # Removing from uncategorized
        updates["uncategorized_items"] = {"type": "delete", "item_name": item_name}

    # Add to destination
    if new_category_name:
        # Adding to a category
        if "categories" not in updates:
            updates["categories"] = {"type": "batch", "actions": []}
            
        updates["categories"]["actions"].append({
            "type": "items_action",
            "category_name": new_category_name,
            "items_action": {"type": "add", "item": item}
        })
    else:
        # Adding to uncategorized
        # Note: If we just removed from uncategorized to add to uncategorized, it's a no-op, but logic holds.
        # However, we can't easily do a batch update for uncategorized_items since it's a list reducer, 
        # but we can return multiple updates in the Command? 
        # Actually Command update merges keys. 'uncategorized_items' key can only have one value.
        # This is a limitation if we are moving WITHIN uncategorized (which doesn't make sense).
        # But if we are moving FROM category TO uncategorized, we have 'categories' update and 'uncategorized_items' update.
        # If we are moving FROM uncategorized TO category, we have 'uncategorized_items' update and 'categories' update.
        # If we are moving FROM category TO category, we have 'categories' update (batch).
        
        # Check collision for 'uncategorized_items' if both source and dest are None (which is a no-op).
        if current_category_name is None:
             return "Item is already in uncategorized items."

        updates["uncategorized_items"] = {"type": "add", "item": item}

    updates["messages"] = [
        ToolMessage(f"Moved {item_name} to {new_category_name if new_category_name else 'uncategorized'}.", tool_call_id=tool_call_id)
    ]
    return Command(update=updates)

item_tools = [add_item_to_category, remove_item_from_category, update_item_quantity, update_item_notes, update_item_category]