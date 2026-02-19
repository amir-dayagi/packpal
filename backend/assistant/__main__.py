import asyncio

from langgraph.checkpoint.memory import InMemorySaver
from assistant.models.trip import Trip
from assistant.assistant import get_assistant_graph, call_assistant, start_assistant

async def main():
    saver = InMemorySaver()
    assistant_graph = get_assistant_graph(saver)
    start_response = start_assistant(assistant_graph, {"configurable": {"thread_id": "test"}})
    trip = start_response["trip"]
    categories = start_response["categories"]
    uncategorized_items = start_response["uncategorized_items"]
    print("Assistant:", start_response["greeting_message"])
    while True:
        user_msg = input("User: ")
        if user_msg == "quit":
            break
        trip = Trip()
        categories = []
        uncategorized_items = []
        print("Assistant: ", end="", flush=True)
        for mode, chunk in call_assistant(assistant_graph, {"configurable": {"thread_id": "test"}}, user_msg, trip=trip, categories=categories, uncategorized_items=uncategorized_items):
            if mode == "messages":
                print(chunk, end="", flush=True)
            elif mode == "values":
                trip = chunk["trip"]
                categories = chunk["categories"]
                uncategorized_items = chunk["uncategorized_items"]
        print()
        print("Trip:", trip)
        print("Categories:", categories)
        print("Uncategorized Items:", uncategorized_items)

if __name__ == "__main__":
    asyncio.run(main())
