from apiflask import APIBlueprint, abort
from flask import current_app, g
from ..utils.auth import auth
from ..utils.assistant import assistant_trip_mapper, assistant_categories_mapper, assistant_uncategorized_items_mapper
from assistant.assistant import get_assistant_graph, call_assistant as call_assistant_service, start_assistant as start_assistant_service, add_system_message as add_system_message_to_assistant
from assistant.models.trip import Trip as AssistantTrip
from assistant.models.category import Category as AssistantCategory
from assistant.models.item import Item as AssistantItem
from langgraph.checkpoint.postgres import PostgresSaver
from ..models.assistant import StartAssistantQuery, StartAssistantResponse, ChatAssistantRequest, ChatAssistantResponse, ChatAssistantResponseMode, ChatAssistantValues, AcceptAssistantRequest, AcceptAssistantResponse
from flask import Response

bp = APIBlueprint('assistant', __name__, url_prefix='/assistant')

@bp.post('/start')
@auth.login_required
@bp.input(StartAssistantQuery, location="query")
@bp.output(StartAssistantResponse, status_code=200)
def start_assistant(query_data: StartAssistantQuery):
    """Start the assistant for the current user"""
    user = auth.current_user

    trip = AssistantTrip()
    categories = []
    uncategorized_items = []

    if query_data.trip_id:
        trip = g.supabase \
            .table('trips') \
            .select('*') \
            .eq('id', query_data.trip_id) \
            .eq('user_id', user.id) \
            .execute()
        
        if not trip.data:
            abort(404, 'Trip not found')
        
        categories = g.supabase \
            .table('categories') \
            .select('*') \
            .eq('trip_id', query_data.trip_id) \
            .execute()

        categorized_items = g.supabase \
            .table('items') \
            .select('*') \
            .eq('trip_id', query_data.trip_id) \
            .not_.is_('category_id', None) \
            .execute()
        
        uncategorized_items = g.supabase \
            .table('items') \
            .select('*') \
            .eq('trip_id', query_data.trip_id) \
            .is_('category_id', None) \
            .execute()
        
        trip = assistant_trip_mapper(trip.data[0])
        categories = assistant_categories_mapper(categories.data, categorized_items.data)
        uncategorized_items = assistant_uncategorized_items_mapper(uncategorized_items.data)
        

    with current_app.connection_pool.connection() as conn:
        memory = PostgresSaver(conn)
        memory.delete_thread(user.id)
        
        assistant_graph = get_assistant_graph(memory)
        config = {"configurable": {"thread_id": user.id}}
        
        response = start_assistant_service(assistant_graph, config, trip, categories, uncategorized_items)
        return StartAssistantResponse(
            message=response["greeting_message"],
            trip=response["trip"],
            categories=response["categories"],
            uncategorized_items=response["uncategorized_items"]
        )
    

@bp.post('/chat')
@auth.login_required
@bp.input(ChatAssistantRequest, location="json")
def chat_assistant(json_data: ChatAssistantRequest):
    user = auth.current_user

    with current_app.connection_pool.connection() as conn:
        memory = PostgresSaver(conn)
        assistant_graph = get_assistant_graph(memory)
        config = {"configurable": {"thread_id": user.id}}
        
        def generate_response():
            for mode, chunk in call_assistant_service(assistant_graph, config, json_data.user_msg, json_data.trip, json_data.categories, json_data.uncategorized_items):
                res = None
                if mode == "messages":
                    res = ChatAssistantResponse(
                        mode=ChatAssistantResponseMode.MESSAGE,
                        content=chunk
                    )   
                elif mode == "values":
                    res = ChatAssistantResponse(
                        mode=ChatAssistantResponseMode.VALUES,
                        content=ChatAssistantValues(
                            trip=chunk["trip"],
                            categories=chunk["categories"],
                            uncategorized_items=chunk["uncategorized_items"]
                       )
                    )
                yield f"data: {res.model_dump_json()}" + "\n\n"
            res = ChatAssistantResponse(
                done=True,
                mode=ChatAssistantResponseMode.MESSAGE,
                content=""
            )
            yield f"data: {res.model_dump_json()}" + "\n\n"
        
        return Response(generate_response(), mimetype='text/event-stream')

@bp.post('/accept')
@auth.login_required
@bp.input(AcceptAssistantRequest, location="json")
@bp.output(AcceptAssistantResponse, status_code=200)
def accept_assistant(json_data: AcceptAssistantRequest):
    user = auth.current_user
    
    # Prepare data for RPC
    trip_dict = json_data.trip.model_dump(mode='json')
    categories_dict = [c.model_dump(mode='json') for c in json_data.categories]
    uncategorized_items_dict = [i.model_dump(mode='json') for i in json_data.uncategorized_items]
    
    try:
        # Call the atomic postgres function
        res = g.supabase.rpc('accept_assistant_results', {
            'p_user_id': user.id,
            'p_trip': trip_dict,
            'p_categories': categories_dict,
            'p_uncategorized_items': uncategorized_items_dict
        }).execute()
        
        trip_id = res.data
        
        return AcceptAssistantResponse(trip_id=trip_id)
        
    except Exception as e:
        with current_app.connection_pool.connection() as conn:
            memory = PostgresSaver(conn)
            assistant_graph = get_assistant_graph(memory)
            config = {"configurable": {"thread_id": user.id}}
            add_system_message_to_assistant(assistant_graph, config, "Failed to accept changes - " + e.message + "\n if user asks to fix the problem, use the error message as context and attempt to fix the problem")
        abort(500, message="Failed to accept changes - " + e.message)
    