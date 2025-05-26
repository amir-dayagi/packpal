from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Dict, Any, List, Optional
import json
from langchain.chat_models import init_chat_model
import os

from pydantic import BaseModel, Field

class SuggestedItem(BaseModel):
    name: str = Field(description="The name of the item")
    quantity: int = Field(description="The quantity of the item")
    reason: str = Field(description="The reason for packing the item")
    notes: Optional[str] = Field(description="Any additional notes for the item")

class SuggestedItems(BaseModel):
    items: List[SuggestedItem] = Field(description="The list of suggested items")

def suggest_items(model: BaseChatModel, trip: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Suggest items for a trip using the LLM model.
    """
    
    # Remove unnecessary fields from the trip copy (don't modify the original trip)
    trip = trip.copy()
    trip_id = trip.pop('id')
    trip.pop('created_at', None)
    trip.pop('updated_at', None)
    trip.pop('user_id', None)

    # Create system template
    system_template = """
You are an expert travel packing assistant. Your primary goal is to provide users with a comprehensive, relevant, and well-justified list of items to pack for their upcoming trip. You will be given details about the trip including its name, description, start date, and end date.

Based on this information, you MUST generate a list of suggested items. For each item, you need to determine:
1.  `name`: The specific name of the item (e.g., "Rain Jacket," "Passport," "Hiking Boots," "T-Shirt"). Be precise.
2.  `quantity`: A sensible and practical quantity for the item, considering the trip's duration (derived from start and end dates) and the nature of the item.
3.  `reason`: A clear and concise explanation of *why* this particular item is useful for *this specific trip*. This reason should directly relate to the trip's description, likely activities, destination type (if inferable), and potential weather conditions (based on dates and description). Generic reasons are not helpful.
4.  `notes` (Optional): Include any additional useful information, such as alternatives, reminders (e.g., "Check if your accommodation provides this," "Ensure it's travel-sized," "Pack in carry-on"), or specific considerations for that item.

**Key considerations for your suggestions:**

* **Contextual Relevance:** Every item and its reason must be directly tied to the provided trip details. Infer activities, environment (e.g., beach, city, mountains, business), and potential needs from the description.
* **Duration:** Calculate the trip duration from the start and end dates to recommend appropriate quantities (e.g., more socks for a longer trip).
* **Weather and Season:** Infer the likely season and potential weather from the dates and description. Suggest weather-appropriate clothing and gear.
* **Comprehensiveness:** Think about various categories:
    * Clothing (layers, activity-specific, formal/casual based on description)
    * Toiletries (consider travel sizes)
    * Electronics (chargers, adapters if destination implies)
    * Documents (passport, visa, tickets – if relevant)
    * Medications (prescriptions, basic first-aid)
    * Activity-specific gear (e.g., swimwear for a beach trip, hiking gear for a mountain trip)
    * Comfort items.
* **Practicality:** Avoid overpacking. Suggest multi-purpose items where appropriate.
* **Specificity:** Be specific in item names. "Medication" is too vague; "Prescription medication" or "Pain relievers" is better. "Shoes" is vague; "Comfortable walking shoes" or "Formal dress shoes" is better.

Your output must strictly follow the structured format for `SuggestedItems` containing a list of `SuggestedItem` objects. Pay close attention to the required fields: `name`, `quantity`, and `reason`.
"""

    # Create messages
    messages = [
        SystemMessage(content=system_template),
        HumanMessage(content=json.dumps(trip))
    ]

    # Invoke the model
    model = model.with_structured_output(SuggestedItems)
    response = model.invoke(messages)

    # Convert the response to a list of dictionaries
    suggested_items = response.model_dump()['items']
    
    # Add trip_id to each suggested item
    for suggested_item in suggested_items:
        suggested_item['trip_id'] = trip_id
    
    return suggested_items


if __name__ == "__main__":
    os.environ["GOOGLE_API_KEY"] = "AIzaSyDoW9VOaCTYdn89grAUMLWgsQILndUG4ws"
    model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
    trip = {
        "created_at": "2025-05-26T22:37:27.528678+00:00",
        "description": "Camping trip to yellowstone",
        "end_date": "2025-12-16",
        "id": 4,
        "name": "Yellowstone",
        "start_date": "2025-12-12",
        "user_id": "e755ca2e-49bb-4445-8902-d7b46cdfa2c8"
    }
    print(suggest_items(model, trip))