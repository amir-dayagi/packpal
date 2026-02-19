from assistant.graphs.creator.nodes.list_generator_node import InitialList
from assistant.models.trip import Trip as AssistantTrip
from assistant.models.category import Category as AssistantCategory
from assistant.models.item import Item as AssistantItem
from typing import List

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