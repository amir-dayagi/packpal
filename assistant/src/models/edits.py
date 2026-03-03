from datetime import date
from typing import Literal, Optional, Union
from pydantic import BaseModel, Field

class AddCategory(BaseModel):
    operation: Literal["add_category"]
    category_name: str = Field(description="The name of the category to add")

class RemoveCategory(BaseModel):
    operation: Literal["remove_category"]
    category_name: str = Field(description="The name of the category to remove")

class UpdateCategoryName(BaseModel):
    operation: Literal["update_category_name"]
    category_name: str = Field(description="The name of the category to update")
    new_category_name: str = Field(description="The new name of the category")

class AddItem(BaseModel):
    operation: Literal["add_item"]
    category_name: Optional[str] = Field(description="The name of the category to add the item to (None if uncategorized)")
    item_name: str = Field(description="The name of the item to add")
    quantity: int = Field(description="The quantity")
    notes: Optional[str] = Field(description="Notes about the item (None if no notes)")

class RemoveItem(BaseModel):
    operation: Literal["remove_item"]
    category_name: Optional[str] = Field(description="The name of the category to remove the item from (None if uncategorized)")
    item_name: str = Field(description="The name of the item to remove")

class UpdateItemName(BaseModel):
    operation: Literal["update_item_name"]
    category_name: Optional[str] = Field(description="The name of the category to update the item in (None if uncategorized)")
    item_name: str = Field(description="The name of the item to update")
    new_item_name: str = Field(description="The new name of the item")

class UpdateItemQuantity(BaseModel):
    operation: Literal["update_item_quantity"]
    category_name: Optional[str] = Field(description="The name of the category to update the item in (None if uncategorized)")
    item_name: str = Field(description="The name of the item to update")
    new_quantity: int = Field(description="The new quantity")

class UpdateItemNotes(BaseModel):
    operation: Literal["update_item_notes"]
    category_name: Optional[str] = Field(description="The name of the category to update the item in (None if uncategorized)")
    item_name: str = Field(description="The name of the item to update")
    new_notes: str = Field(description="The new notes")

class MoveItem(BaseModel):
    operation: Literal["move_item"]
    category_name: Optional[str] = Field(description="The name of the category to move the item from (None if uncategorized)")
    item_name: str = Field(description="The name of the item to move")
    new_category_name: Optional[str] = Field(description="The name of the category to move the item to (None if uncategorized)")

class UpdateTripName(BaseModel):
    operation: Literal["update_trip_name"]
    new_trip_name: str = Field(description="The new name of the trip")

class UpdateTripDescription(BaseModel):
    operation: Literal["update_trip_description"]
    new_trip_description: str = Field(description="The new description of the trip")

class UpdateTripStartDate(BaseModel):
    operation: Literal["update_trip_start_date"]
    new_trip_start_date: date = Field(description="The new start date of the trip")

class UpdateTripEndDate(BaseModel):
    operation: Literal["update_trip_end_date"]
    new_trip_end_date: date = Field(description="The new end date of the trip")


edits_union = Union[
    AddCategory, 
    RemoveCategory, 
    UpdateCategoryName, 
        AddItem, 
        RemoveItem, 
        UpdateItemName, 
        UpdateItemQuantity, 
        UpdateItemNotes, 
        MoveItem, 
        UpdateTripName, 
        UpdateTripDescription, 
        UpdateTripStartDate, 
        UpdateTripEndDate
    ]