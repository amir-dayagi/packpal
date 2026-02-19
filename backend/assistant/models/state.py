from pydantic import BaseModel
from typing import Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from assistant.models.trip import Trip, trip_reducer
from assistant.models.category import Category, category_reducer
from assistant.models.item import Item, item_reducer

class State(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages] = []
    trip: Annotated[Trip, trip_reducer] = Trip()
    categories: Annotated[List[Category], category_reducer] = []
    uncategorized_items: Annotated[List[Item], item_reducer] = []