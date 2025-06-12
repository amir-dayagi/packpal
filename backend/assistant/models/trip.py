from pydantic import BaseModel
from typing import Optional

class Trip(BaseModel):
    id: Optional[int] = None
    name: str = ""
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None