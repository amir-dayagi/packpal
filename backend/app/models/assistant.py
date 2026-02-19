from typing import Optional, List, Union
from pydantic import BaseModel
from enum import Enum
from assistant.models.trip import Trip as AssistantTrip
from assistant.models.category import Category as AssistantCategory
from assistant.models.item import Item as AssistantItem

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

class ChatAssistantValues(BaseModel):
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