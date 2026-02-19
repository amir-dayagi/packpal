import os
from dotenv import load_dotenv
from datetime import date
from assistant.models.category import Category
from assistant.models.item import Item
from assistant.models.state import State
from langchain_core.messages import SystemMessage
from langchain.chat_models import init_chat_model
from pydantic import BaseModel
from typing import List
from langchain_core.messages import AIMessage

load_dotenv()

def get_system_prompt(state: State):
    return f"""
You are a Logistics Engine designed to generate a highly personalized, starting packing list. You analyze trip data to provide a structured JSON output.

Core Directives:

Data Analysis: > * Calculate trip duration. Apply the N+1 rule for clothing (e.g., 5 days = 6 sets of socks/underwear), capping essentials at 10 to imply a laundry cycle for longer trips.

Infer climate/needs based on the name (destination) and start_date.

Mandatory Categories: You must include:

Clothing (Based on duration/climate)

Toiletries (Hygiene and liquids)

Health & Meds (Prescriptions, basic first aid)

Travel Docs (Passport, visas, bookings)

Electronics (Cables, adapters, power banks)

Essentials (Water bottle, umbrella/sunglasses)

Description-Based Logic: If the user mentions "Hiking," "Wedding," or "Gym," add a dedicated category for that activity.

Output Specification: Return a valid JSON object. Leave IDs as NULL! Also return a message to the user explaining what you added and why.


Context:
    - Name: {state.trip.name or "Not set"}
    - Start Date: {state.trip.start_date or "Not set"}
    - End Date: {state.trip.end_date or "Not set"}
    - Description: {state.trip.description or "None"}
"""

class InitialList(BaseModel):
    categories: List[Category]
    uncategorized_items: List[Item]
    message: str

def create_list_generator_node():
    llm = init_chat_model("google_genai:gemini-2.0-flash")
    generator = llm.with_structured_output(InitialList)

    def node(state: State):
        messages = [SystemMessage(content=get_system_prompt(state)), *state.messages]
        response = generator.invoke(messages)
        for category in response.categories:
            category.id = None
            for item in category.items:
                item.id = None
        for item in response.uncategorized_items:
            item.id = None
        return {"messages": [AIMessage(content=response.message)], "categories": response.categories, "uncategorized_items": response.uncategorized_items}
    
    return node