from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import date, datetime
from langchain_core.messages import AIMessage, SystemMessage

from src.utils.llm import get_llm
from src.models.state import MainState

class ChatResponse(BaseModel):
    chat_response: str = Field(
        description="The conversational message to the user. Acknowledge input and ask for one missing field."
    )
    name: Optional[str] = Field(None, description="The name of the trip")
    description: Optional[str] = Field(None, description="A brief description of the trip")
    start_date: Optional[str] = Field(None, description="The start date of the trip as an ISO date string YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="The end date of the trip as an ISO date string YYYY-MM-DD")

llm = get_llm().with_structured_output(ChatResponse, strict=True)

async def chat_node(state: MainState):
    current_trip = state.trip
    missing = [field for field, value in current_trip.dict().items() 
               if value is None and field != "id"]
    today = date.today().strftime("%A, %B %d, %Y")
    
    system_prompt = f"""
You are "PackPal," a creative and helpful Travel Consultant. Your goal is to help the user plan a trip so you can eventually create a perfect packing list for them.

TODAY'S DATE: {today}
CURRENT TRIP DATA: {current_trip.json()}

YOUR PHILOSOPHY:
- Be warm, conversational, and helpful. Do not sound like a form-filler.
- If the user provides information, acknowledge it enthusiastically.
- Focus on ONE missing detail at a time to keep the conversation flowing.

SPECIFIC FIELD LOGIC:
1. **Name**: If missing, ask for their destination. Once provided, internally generate a name (e.g., "Trip to the Andes") and save it to the 'name' field immediately.
2. **Dates**: Use TODAY'S DATE to resolve relative terms (e.g., "next Friday"). If the user provides a duration (e.g., "2 weeks") but no start date, ask for the start date while keeping the duration in mind.
3. **Description**: Don't ask for a "description." Ask about their planned activities (e.g., "Will you be hiking, attending formal dinners, or just relaxing?"). Synthesize their reply into a 1-2 sentence compelling summary for the 'description' field.

INSTRUCTIONS:
- Review the CURRENT TRIP DATA and the latest user message. 
- If the user just provided info, extract it into the tool fields. 
- In 'chat_response', respond naturally. If all fields are finally filled, give a vibrant summary of the trip details and transition by saying: "I have everything I need! I'm starting to put together your custom packing list now."
- If fields are still missing, ask for the next one using the "Natural Approach" described above.

CRITICAL FORMATTING RULE:
You must provide dates in the string format "YYYY-MM-DD".
NEVER use a list like [2026, 2, 22] for dates. This will cause a system crash.

MISSING FIELDS TO FOCUS ON: {', '.join(missing)}
"""
    
    response = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        *state.messages
    ])
    
    updated_trip = current_trip.model_copy(update=response.model_dump(exclude_none=True))
    
    return {
        "trip": updated_trip,
        "messages": [AIMessage(content=response.chat_response)]
    }