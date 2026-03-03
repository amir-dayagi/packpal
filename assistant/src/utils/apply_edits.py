from typing import List, Tuple
from src.models.trip import Trip, trip_reducer
from src.models.category import Category, categories_reducer
from src.models.item import Item, items_reducer
from src.models.edits import (
    edits_union, AddCategory, RemoveCategory, UpdateCategoryName,
    AddItem, RemoveItem, UpdateItemName, UpdateItemQuantity, UpdateItemNotes, MoveItem,
    UpdateTripName, UpdateTripDescription, UpdateTripStartDate, UpdateTripEndDate
)
from src.models.state import EditorState

def apply_edits(
    state: EditorState, edits: List[edits_union]
) -> Tuple[Trip, List[Category], List[Item]]:
    
    new_trip = state.trip.model_copy(deep=True)
    new_categories = [c.model_copy(deep=True) for c in state.categories]
    new_uncategorized_items = [i.model_copy(deep=True) for i in state.uncategorized_items]

    def get_category(name: str) -> Category:
        for c in new_categories:
            if c.name == name:
                return c
        raise ValueError(f"Category '{name}' does not exist.")

    def get_item(items: List[Item], name: str) -> Item:
        for i in items:
            if i.name == name:
                return i
        raise ValueError(f"Item '{name}' does not exist.")

    def is_item_name_taken(name: str) -> bool:
        if any(i.name == name for i in new_uncategorized_items):
            return True
        for c in new_categories:
            if any(i.name == name for i in c.items):
                return True
        return False

    for edit in edits:
        if isinstance(edit, AddCategory):
            if any(c.name == edit.category_name for c in new_categories):
                raise ValueError(f"Cannot add category '{edit.category_name}' as it already exists.")
            new_categories = categories_reducer(new_categories, {"type": "add", "category": Category(name=edit.category_name, items=[])})
            
        elif isinstance(edit, RemoveCategory):
            if not any(c.name == edit.category_name for c in new_categories):
                raise ValueError(f"Cannot remove category '{edit.category_name}' as it does not exist.")
            new_categories = categories_reducer(new_categories, {"type": "delete", "category_name": edit.category_name})
            
        elif isinstance(edit, UpdateCategoryName):
            if not any(c.name == edit.category_name for c in new_categories):
                raise ValueError(f"Cannot update category '{edit.category_name}' as it does not exist.")
            if any(c.name == edit.new_category_name for c in new_categories):
                raise ValueError(f"Cannot rename category to '{edit.new_category_name}' as a category with this name already exists.")
            new_categories = categories_reducer(new_categories, {
                "type": "update_name",
                "category_name": edit.category_name,
                "new_name": edit.new_category_name
            })
            
        elif isinstance(edit, AddItem):
            if is_item_name_taken(edit.item_name):
                raise ValueError(f"Cannot add item '{edit.item_name}' as an item with this name already exists.")
            if edit.category_name is not None:
                c = get_category(edit.category_name)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.category_name,
                    "items_action": {"type": "add", "item": Item(name=edit.item_name, quantity=edit.quantity, notes=edit.notes)}
                })
            else:
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "add",
                    "item": Item(name=edit.item_name, quantity=edit.quantity, notes=edit.notes)
                })
                
        elif isinstance(edit, RemoveItem):
            if edit.category_name is not None:
                c = get_category(edit.category_name)
                get_item(c.items, edit.item_name)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.category_name,
                    "items_action": {"type": "delete", "item_name": edit.item_name}
                })
            else:
                get_item(new_uncategorized_items, edit.item_name)
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "delete",
                    "item_name": edit.item_name
                })
                
        elif isinstance(edit, UpdateItemName):
            if is_item_name_taken(edit.new_item_name):
                raise ValueError(f"Cannot rename item '{edit.item_name}' to '{edit.new_item_name}' as an item with this name already exists.")
            if edit.category_name is not None:
                c = get_category(edit.category_name)
                i = get_item(c.items, edit.item_name)
                i.name = edit.new_item_name
            else:
                i = get_item(new_uncategorized_items, edit.item_name)
                i.name = edit.new_item_name
                
        elif isinstance(edit, UpdateItemQuantity):
            if edit.category_name is not None:
                c = get_category(edit.category_name)
                get_item(c.items, edit.item_name)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.category_name,
                    "items_action": {"type": "update_quantity", "item_name": edit.item_name, "new_quantity": edit.new_quantity}
                })
            else:
                get_item(new_uncategorized_items, edit.item_name)
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "update_quantity",
                    "item_name": edit.item_name,
                    "new_quantity": edit.new_quantity
                })
                
        elif isinstance(edit, UpdateItemNotes):
            if edit.category_name is not None:
                c = get_category(edit.category_name)
                get_item(c.items, edit.item_name)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.category_name,
                    "items_action": {"type": "update_notes", "item_name": edit.item_name, "new_notes": edit.new_notes}
                })
            else:
                get_item(new_uncategorized_items, edit.item_name)
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "update_notes",
                    "item_name": edit.item_name,
                    "new_notes": edit.new_notes
                })
                
        elif isinstance(edit, MoveItem):
            if edit.category_name is not None:
                c_src = get_category(edit.category_name)
                i_src = get_item(c_src.items, edit.item_name)
                i_to_move = i_src.model_copy(deep=True)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.category_name,
                    "items_action": {"type": "delete", "item_name": edit.item_name}
                })
            else:
                i_src = get_item(new_uncategorized_items, edit.item_name)
                i_to_move = i_src.model_copy(deep=True)
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "delete",
                    "item_name": edit.item_name
                })
                
            if edit.new_category_name is not None:
                c_dst = get_category(edit.new_category_name)
                new_categories = categories_reducer(new_categories, {
                    "type": "items_action",
                    "category_name": edit.new_category_name,
                    "items_action": {"type": "add", "item": i_to_move}
                })
            else:
                new_uncategorized_items = items_reducer(new_uncategorized_items, {
                    "type": "add",
                    "item": i_to_move
                })
                
        elif isinstance(edit, UpdateTripName):
            new_trip = trip_reducer(new_trip, {
                "type": "update_name",
                "new_name": edit.new_trip_name
            })
            
        elif isinstance(edit, UpdateTripDescription):
            new_trip = trip_reducer(new_trip, {
                "type": "update_description",
                "new_description": edit.new_trip_description
            })
            
        elif isinstance(edit, UpdateTripStartDate):
            new_trip = trip_reducer(new_trip, {
                "type": "update_dates",
                "new_start_date": edit.new_trip_start_date,
                "new_end_date": new_trip.end_date
            })
            
        elif isinstance(edit, UpdateTripEndDate):
            new_trip = trip_reducer(new_trip, {
                "type": "update_dates",
                "new_start_date": new_trip.start_date,
                "new_end_date": edit.new_trip_end_date
            })
            
        else:
            raise ValueError(f"Unknown edit operation of type {type(edit)}: {edit}")

    return new_trip, new_categories, new_uncategorized_items