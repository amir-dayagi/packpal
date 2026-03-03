from datetime import date
from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel

class AssistantItem(BaseModel):
    id: Optional[int] = None
    name: str = ""
    quantity: int = 0
    notes: Optional[str] = None

class AssistantCategory(BaseModel):
    id: Optional[int] = None
    name: str = ""
    items: List[AssistantItem] = []

class AssistantTrip(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class StartAssistantQuery(BaseModel):
    trip_id: Optional[int] = None

class StartAssistantResponse(BaseModel):
    message: str
    trip: AssistantTrip
    categories: List[AssistantCategory]
    uncategorized_items: List[AssistantItem]

class ChatAssistantRequest(BaseModel):
    user_msg: str
    trip: AssistantTrip
    categories: List[AssistantCategory]
    uncategorized_items: List[AssistantItem]

class ChatAssistantResponseMode(str, Enum):
    MESSAGE = "message"
    VALUES = "values"

class ChatAssistantMessageRole(str, Enum):
    HUMAN = "human"
    AI = "ai"

class ChatAssistantMessage(BaseModel):
    type: ChatAssistantMessageRole
    content: str

class ChatAssistantValues(BaseModel):
    messages: List[ChatAssistantMessage]
    trip: AssistantTrip
    categories: List[AssistantCategory]
    uncategorized_items: List[AssistantItem]

class ChatAssistantResponse(BaseModel):
    done: bool = False
    mode: ChatAssistantResponseMode
    content: Union[str, ChatAssistantValues]

class AcceptAssistantRequest(BaseModel):
    trip: AssistantTrip
    categories: List[AssistantCategory]
    uncategorized_items: List[AssistantItem]

class AcceptAssistantResponse(BaseModel):
    trip_id: int