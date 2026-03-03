from typing import List
from langgraph_sdk import get_client
from partial_json_parser import loads, Allow

from ..config import Config
from ..models.assistant import AssistantTrip, AssistantCategory, AssistantItem

client = get_client(url=Config.ASSISTANT_API_URL)

async def start_assistant(
    thread_id: str,
    trip: AssistantTrip = AssistantTrip(),
    categories: List[AssistantCategory] = [],
    uncategorized_items: List[AssistantItem] = [],
):
    """Start the assistant for the current user
    
    Args:
        thread_id: The thread id
        trip: The trip to start the assistant for
        categories: The categories for the trip
        uncategorized_items: The uncategorized items for the trip
    
    Returns:
        {
            "greeting_message": str,
            "trip": AssistantTrip,
            "categories": List[AssistantCategory],
            "uncategorized_items": List[AssistantItem]
        }
    """
    # if thread exists, delete it so a new conversation starts
    try:
        await client.threads.get(thread_id)
        await client.threads.delete(thread_id)
    except Exception:
        pass
    await client.threads.create(thread_id=thread_id)

    initial_values = {
        "trip": trip.model_dump() if hasattr(trip, 'model_dump') else trip,
        "categories": [c.model_dump() if hasattr(c, 'model_dump') else c for c in categories],
        "uncategorized_items": [i.model_dump() if hasattr(i, 'model_dump') else i for i in uncategorized_items],
        "messages": []
    }

    result = await client.runs.wait(
        thread_id,
        "assistant",
        input=initial_values
    )
    
    return {
        "greeting_message": result.get("messages")[-1].get("content"),
        "trip": result.get("trip"),
        "categories": result.get("categories"),
        "uncategorized_items": result.get("uncategorized_items")
    }

async def call_assistant(
    thread_id: str,
    user_msg: str, 
    trip: AssistantTrip = AssistantTrip(), 
    categories: List[AssistantCategory] = [], 
    uncategorized_items: List[AssistantItem] = [], 
):
    """Call the assistant for the current user
    
    Args:
        thread_id: The thread id
        user_msg: The user message
        trip: The current trip
        categories: The current categories
        uncategorized_items: The current uncategorized items
    
    Returns:
        (
            mode: messages | values,
            content: str | {
                "messages": List[ChatAssistantMessage],
                "trip": AssistantTrip,
                "categories": List[AssistantCategory],
                "uncategorized_items": List[AssistantItem]
            }
        )
    """
    if not user_msg:
        raise ValueError("User message is required.")

    input_data = {
        "messages": [{"role": "user", "content": user_msg}],
        "trip": trip.model_dump() if hasattr(trip, 'model_dump') else trip,
        "categories": [c.model_dump() if hasattr(c, 'model_dump') else c for c in categories],
        "uncategorized_items": [i.model_dump() if hasattr(i, 'model_dump') else i for i in uncategorized_items]
    }

    json_buffer = ""
    last_sent_text = ""

    async for event in client.runs.stream(
        thread_id,
        "assistant",
        input=input_data,
        stream_mode=["events", "values"],
    ):
        mode = event.event
        data = event.data

        if mode == "events" and data.get("event") == "on_chat_model_stream":
            token = data.get("data", {}).get("chunk", {}).get("content", "")
            json_buffer += token

            try:
                parsed = loads(json_buffer, Allow.STR | Allow.OBJ)
                current_text = parsed.get("chat_response", "")
                if len(current_text) > len(last_sent_text):
                    new_chars = current_text[len(last_sent_text):]
                    yield "messages", new_chars
                    last_sent_text = current_text
            except Exception:
                pass

        elif mode == "values":
            yield "values", {
                "messages": [msg for msg in data.get("messages") if msg["type"] in ["human", "ai"]],
                "trip": data.get("trip"),
                "categories": data.get("categories"),
                "uncategorized_items": data.get("uncategorized_items")
            }

def assistant_trip_mapper(trip: dict) -> AssistantTrip:
    return AssistantTrip(
        id=trip.get("id", None),
        name=trip["name"],
        description=trip["description"],
        start_date=trip["start_date"],
        end_date=trip["end_date"]
    )

def assistant_categories_mapper(categories: List[dict], items: List[dict]) -> List[AssistantCategory]:
    cateogries = {
        category["id"]: AssistantCategory(
            id=category.get("id", None),
            name=category["name"],
            items=[]
        ) for category in categories
    }
    for item in items:
        cateogries[item["category_id"]].items.append(AssistantItem(
            id=item.get("id", None),
            name=item["name"],
            quantity=item["list_quantity"],
            notes=item["notes"]
        ))
    return list(cateogries.values())
        

def assistant_uncategorized_items_mapper(items: List[dict]) -> List[AssistantItem]:
    return [AssistantItem(
        id=item.get("id", None),
        name=item["name"],
        quantity=item["list_quantity"],
        notes=item["notes"]
    ) for item in items]