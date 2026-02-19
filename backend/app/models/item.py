from enum import Enum
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ItemOrigin(str, Enum):
    LISTED = "listed"
    PURCHASED = "purchased"

class Item(BaseModel):
    id: int
    trip_id: int
    created_at: datetime
    name: str
    notes: Optional[str] = None
    list_quantity: Optional[int] = None
    packed_quantity: Optional[int] = None
    returning_quantity: Optional[int] = None
    purchased_quantity: Optional[int] = None
    category_id: Optional[int] = None
    origin: ItemOrigin

class CreateItemRequest(BaseModel):
    trip_id: int
    name: str
    origin: ItemOrigin = ItemOrigin.LISTED
    quantity: Optional[int] = 1
    notes: Optional[str] = None
    category_id: Optional[int] = None

class UpdateItemRequest(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None

class PackedRequest(BaseModel):
    is_entire_quantity: bool = True
    quantity: Optional[int] = 0

class ReturningRequest(BaseModel):
    is_entire_quantity: bool = True
    quantity: Optional[int] = 0

class ItemResponse(BaseModel):
    item: Item

class ItemsResponse(BaseModel):
    items: List[Item]