from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TripStatus(str, Enum):
    PACKING = "packing"
    TRAVELING = "traveling"
    COMPLETED = "completed"

class TripStatusQuery(BaseModel):
    packing: Optional[bool] = True
    traveling: Optional[bool] = True
    completed: Optional[bool] = False

class Trip(BaseModel):
    id: int
    created_at: datetime
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    status: TripStatus

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
    status: Optional[TripStatus] = None

class TripResponse(BaseModel):
    trip: Trip

class TripsResponse(BaseModel):
    trips: List[Trip]