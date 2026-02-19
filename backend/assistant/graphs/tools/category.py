from typing import Annotated
from langchain_core.tools import tool, InjectedToolCallId
from langgraph.prebuilt import InjectedState
from langgraph.types import Command
from langchain_core.messages import ToolMessage

from assistant.models.category import Category
from assistant.models.state import State

@tool
def add_category(state: Annotated[State, InjectedState], 
                 tool_call_id: Annotated[str, InjectedToolCallId],
                 category_name: str) -> str:
    """
    Creates a new empty category.
    """
    # Check if category already exists
    if any(c.name == category_name for c in state.categories):
        return f"Category '{category_name}' already exists."

    new_category = Category(name=category_name, items=[])
    
    return Command(update={
        "categories": {"type": "add", "category": new_category},
        "messages": [ToolMessage(f"Created category '{category_name}'.", tool_call_id=tool_call_id)]
    })

@tool
def remove_category(state: Annotated[State, InjectedState],
                    tool_call_id: Annotated[str, InjectedToolCallId],
                    category_name: str) -> str:
    """
    Removes a category. 
    WARNING: This will delete all items within this category.
    """
    category = next((c for c in state.categories if c.name == category_name), None)
    if not category:
        return f"Category '{category_name}' not found."
    
    return Command(update={
        "categories": {"type": "delete", "category_name": category_name},
        "messages": [ToolMessage(f"Removed category '{category_name}'.", tool_call_id=tool_call_id)]
    })

@tool
def update_category_name(state: Annotated[State, InjectedState],
                         tool_call_id: Annotated[str, InjectedToolCallId],
                         old_name: str, new_name: str) -> str:
    """
    Renames an existing category.
    """
    category = next((c for c in state.categories if c.name == old_name), None)
    if not category:
        return f"Category '{old_name}' not found."
    
    if any(c.name == new_name for c in state.categories):
        return f"Category '{new_name}' already exists."
    
    return Command(update={
        "categories": {"type": "update_name", "category_name": old_name, "new_name": new_name},
        "messages": [ToolMessage(f"Renamed category '{old_name}' to '{new_name}'.", tool_call_id=tool_call_id)]
    })

category_tools = [add_category, remove_category, update_category_name]
