from pydantic import BaseModel, Field
from typing import List
from langchain_core.messages import AIMessage, SystemMessage

from src.utils.llm import get_llm
from src.utils.apply_edits import apply_edits
from src.models.state import EditorState
from src.models.edits import edits_union

class EditorResponse(BaseModel):
    internal_assessment: str = Field(
        description="Think step-by-step: What did the user ask? What is missing from the trip context? What proactive advice can I give?"
    )

    chat_response: str = Field(
        description="Your message to the user. Must follow the Lead-Assist-Prompt structure."
    )
    
    edits: List[edits_union] = Field(default_factory=list, description="List of sequential edits to apply")
    
    

llm = get_llm().with_structured_output(EditorResponse, strict=True)

async def editor_node(state: EditorState):
    trip = state.trip
    categories = state.categories
    uncategorized_items = state.uncategorized_items
    
    few_shot_examples = """
---
EXAMPLES OF THE PROACTIVE LEADERSHIP STYLE:

Example 1:
User: "I'm going to Paris."
Assistant Tool Call: {
  "internal_assessment": "User provided destination. Suggesting name and asking for dates.",
  "edits": [{"operation": "update_trip_name", "new_value": "Parisian Getaway"}],
  "chat_response": "Paris! A classic. I've named this trip 'Parisian Getaway.' To get your packing list started, do you know your travel dates, or should we focus on what activities you have planned first?"
}

Example 2:
User: "Add a warm coat."
Assistant Tool Call: {
  "internal_assessment": "Adding coat. Noticing it's a 10-day trip to Sweden. User will need more than just one layer.",
  "edits": [{"operation": "add_item", "item_name": "Warm Coat", "category_name": "Clothing", "new_value": 1}],
  "chat_response": "Got the coat on the list! Since you'll be in Sweden for 10 days, would you like me to add a few thermal base layers as well, or should we look at your footwear needs?"
}
---
"""

    last_msg = state.messages[-1]
    error_context = ""
    if isinstance(last_msg, SystemMessage) and "Error:" in last_msg.content:
        error_context = f"\n\nATTENTION: Your previous attempt failed with this error: {last_msg.content}\nPlease correct your edits based on the available categories and items."

    system_prompt = f"""
You are "PackPal," the lead strategist for this trip. You don't just take orders; you anticipate needs and drive the conversation.

YOUR CORE MISSION:
1. **Analyze**: Look at the current trip description and the list. What's missing? (e.g., If they are flying, do they have a carry-on? If it's sunny, where is the SPF?)
2. **Execute**: Perform any specific edits requested by the user.
3. **Anticipate**: Be proactive. Suggest items or categories based on the trip's destination, weather, or duration that the user hasn't thought of yet.
4. **Lead**: Every single response must end with a clear "Suggested Next Step" to guide the user.

LEADERSHIP COMMUNICATION STYLE (LAP):
- **Lead**: Acknowledge what was done with confidence.
- **Assist**: Offer a proactive insight or ask a clarifying question about the trip.
- **Prompt**: Tell the user exactly what they can ask you next (e.g., "Would you like me to add a 'Tech Essentials' category, or should we adjust the quantities for your flight?").

CURRENT CONTEXT:
Trip: {trip.model_dump_json()}
Categories: {[c.model_dump_json() for c in categories]}
Uncategorized Items: {[i.model_dump_json() for i in uncategorized_items]}

{few_shot_examples}

{error_context}
    """
    
    try:
        response = await llm.ainvoke([SystemMessage(content=system_prompt), *state.messages])
        
        
        new_trip, new_categories, new_uncategorized_items = apply_edits(state, response.edits)
        
        return {
            "trip": new_trip,
            "categories": new_categories,
            "uncategorized_items": new_uncategorized_items,
            "messages": [AIMessage(content=response.chat_response)]
        }
    except Exception as e:
        return {
            "messages": [SystemMessage(content=f"Error: {str(e)}")],
            "retry_count": state.retry_count + 1
        }