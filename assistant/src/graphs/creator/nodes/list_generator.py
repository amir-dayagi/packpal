from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import date, datetime
from langchain_core.messages import AIMessage, SystemMessage

from src.utils.llm import get_llm
from src.models.state import MainState
from src.models.category import Category
from src.models.item import Item

class ListGeneratorResponse(BaseModel):
    categories: List[Category]
    uncategorized_items: List[Item]
    chat_response: str = Field(description="A warm, excited message explaining why these items were chosen.")

llm = get_llm().with_structured_output(ListGeneratorResponse, strict=True)

async def list_generator_node(state: MainState):
    trip = state.trip
    if isinstance(trip.start_date, str):
        trip.start_date = datetime.strptime(trip.start_date, "%Y-%m-%d")
    if isinstance(trip.end_date, str):
        trip.end_date = datetime.strptime(trip.end_date, "%Y-%m-%d")
    duration = (trip.end_date - trip.start_date).days
    
    system_prompt = f"""
    You are the "PackPal" Master Organizer. 
    Create a highly personalized packing list for the following trip:
    
    TRIP: {trip.name}
    DESCRIPTION: {trip.description}
    DATES: {trip.start_date} to {trip.end_date} ({duration} days)
    
    GUIDELINES:
    1. **Personalization**: If the description mentions hiking, include gear like boots or poles. If it's a city trip, focus on versatile layers.
    2. **Quantities**: Base quantities on the {duration} day duration.
    3. **Categorization**: Group items logically (e.g., "Clothing", "Electronics", "Toiletries", "Activity Specific").
    4. **Notes**: Add helpful tips in the 'notes' field (e.g., "Pack a universal adapter for UK outlets").
    5. **Tone**: Be enthusiastic in the 'chat_response'.
    """
    
    response = await llm.ainvoke([SystemMessage(content=system_prompt), *state.messages])

    for category in response.categories:
        category.id = None
        for item in category.items:
            item.id = None
    
    for item in response.uncategorized_items:
        item.id = None
    
    return {
        "categories": response.categories,
        "uncategorized_items": response.uncategorized_items,
        "messages": [AIMessage(content=response.chat_response)]
    }