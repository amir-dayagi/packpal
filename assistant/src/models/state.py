from pydantic import BaseModel
from typing import Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from src.models.trip import Trip, trip_reducer
from src.models.category import Category, categories_reducer
from src.models.item import Item, items_reducer

class MainState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages] = []
    trip: Annotated[Trip, trip_reducer] = Trip()
    categories: Annotated[List[Category], categories_reducer] = []
    uncategorized_items: Annotated[List[Item], items_reducer] = []

class EditorState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages] = []
    trip: Annotated[Trip, trip_reducer] = Trip()
    categories: Annotated[List[Category], categories_reducer] = []
    uncategorized_items: Annotated[List[Item], items_reducer] = []
    retry_count: int = 0
