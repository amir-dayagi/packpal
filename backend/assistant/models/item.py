from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    id: Optional[int] = None
    name: str = ""
    quantity: int = 0
    notes: Optional[str] = None