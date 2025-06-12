from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Trip(BaseModel):
    id: int
    created_at: datetime
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str

class CreateTripRequest(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str

class UpdateTripRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None