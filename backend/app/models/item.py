from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Item(BaseModel):
    id: int
    trip_id: int
    created_at: datetime
    name: str
    quantity: int
    notes: Optional[str] = None
    is_packed: bool
    is_returning: bool

class CreateItemRequest(BaseModel):
    trip_id: int
    name: str
    quantity: int
    notes: Optional[str] = None

class UpdateItemRequest(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None
    is_packed: Optional[bool] = None
    is_returning: Optional[bool] = None