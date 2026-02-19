import os
from dotenv import load_dotenv
from datetime import date
from assistant.models.trip import Trip
from assistant.models.state import State
from langchain_core.messages import SystemMessage
from langchain.chat_models import init_chat_model

load_dotenv()

def get_system_prompt(state: State):
    return f"""
You are a data extraction engine. Your sole purpose is to monitor a conversation between a user and a travel assistant and update a structured Trip object.

Output Format: You must return a valid JSON object matching the provided schema.

Extraction Logic:

ID: Leave as null!

Dates: Convert any relative dates (e.g., "next Friday," "tomorrow") into absolute YYYY-MM-DD format based on today's date. Look at old messages to see if the user has provided a duration (e.g., "two weeks"). If so, calculate the end date. Never assume the start date of the trip!
Make sure that your date is valid! if not sure, don't use it!

Name: If the user doesn't provide a specific name, use the destination and the year (e.g., "Japan - 2026").

Description: Capture context about the trip type, weather expectations, or activities mentioned (e.g., "Business casual," "Backpacking," "Attending a wedding").

Persistence: Look at the context of the current trip state. If a value was previously identified and not corrected by the user, keep it. If the user changes their mind, update it to the newest value.


Context:
Today's date: {date.today().strftime("%Y-%m-%d")}

Trip:
- Name: {state.trip.name or "Not set"}
- Start Date: {state.trip.start_date or "Not set"}
- End Date: {state.trip.end_date or "Not set"}
- Description: {state.trip.description or "Not set"}
"""

def create_extraction_node():
    llm = init_chat_model("google_genai:gemini-2.0-flash")
    extractor = llm.with_structured_output(Trip)

    def node(state: State):
        messages = [SystemMessage(content=get_system_prompt(state)), *state.messages]
        response = extractor.invoke(messages)
        response.id = None
        return {"trip": response}

    return node