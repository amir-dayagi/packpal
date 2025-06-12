from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class AssistantRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"

class AssistantChatMessage(BaseModel):
    role: AssistantRole
    content: str

class AssistantTrip(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str

class AssistantItem(BaseModel):
    id: Optional[int] = None
    name: str
    quantity: int
    notes: Optional[str] = None
    
class AssistantChatRequest(BaseModel):
    message: str
    trip: AssistantTrip
    packing_list: List[AssistantItem]

class AssistantStreamResponse(BaseModel):
    message: AssistantChatMessage
    trip: AssistantTrip
    packing_list: List[AssistantItem]
    done: bool = False

class AssistantProcessRequest(BaseModel):
    user_id: str
    payload: str

class AssistantChangesRequest(BaseModel):
    trip: AssistantTrip
    packing_list: List[AssistantItem]