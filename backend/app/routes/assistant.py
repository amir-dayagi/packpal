from quart import Response, Blueprint, g, abort
from quart.utils import run_sync
from quart_schema import validate_querystring, validate_request, validate_response

from ..models.assistant import AssistantTrip, AssistantCategory, AssistantItem, StartAssistantQuery, StartAssistantResponse, ChatAssistantRequest, ChatAssistantResponse, ChatAssistantResponseMode, ChatAssistantValues, AcceptAssistantRequest, AcceptAssistantResponse
from ..utils.auth import login_required
from ..utils.assistant import assistant_trip_mapper, assistant_categories_mapper, assistant_uncategorized_items_mapper, start_assistant as start_assistant_service, call_assistant as call_assistant_service

bp = Blueprint('assistant', __name__, url_prefix='/assistant')

@bp.route('/start', methods=['POST'])
@login_required
@validate_querystring(StartAssistantQuery)
@validate_response(StartAssistantResponse, status_code=200)
async def start_assistant(query_args: StartAssistantQuery):
    """Start the assistant for the current user"""
    user = g.user

    trip = AssistantTrip()
    categories = []
    uncategorized_items = []

    if query_args.trip_id:
        trip = await run_sync(g.supabase \
            .table('trips') \
            .select('*') \
            .eq('id', query_args.trip_id) \
            .eq('user_id', user.id) \
            .execute)()
        
        if not trip.data:
            abort(404, 'Trip not found')
        
        categories = await run_sync(g.supabase \
            .table('categories') \
            .select('*') \
            .eq('trip_id', query_args.trip_id) \
            .execute)()

        categorized_items = await run_sync(g.supabase \
            .table('items') \
            .select('*') \
            .eq('trip_id', query_args.trip_id) \
            .not_.is_('category_id', None) \
            .execute)()
        
        uncategorized_items = await run_sync(g.supabase \
            .table('items') \
            .select('*') \
            .eq('trip_id', query_args.trip_id) \
            .is_('category_id', None) \
            .execute)()
        
        trip = assistant_trip_mapper(trip.data[0])
        categories = assistant_categories_mapper(categories.data, categorized_items.data)
        uncategorized_items = assistant_uncategorized_items_mapper(uncategorized_items.data)
        

    try:
        response = await start_assistant_service(
            thread_id=user.id,
            trip=trip,
            categories=categories,
            uncategorized_items=uncategorized_items
        )
        
        return StartAssistantResponse(
            message=str(response["greeting_message"]),
            trip=AssistantTrip.model_validate(response["trip"]),
            categories=[AssistantCategory.model_validate(category) for category in response["categories"]],
            uncategorized_items=[AssistantItem.model_validate(item) for item in response["uncategorized_items"]]
        )
    except Exception as e:
        abort(500, description=f"Internal Assistant Error: {e}")
    

@bp.route('/chat', methods=['POST'])
@login_required
@validate_request(ChatAssistantRequest)
async def chat_assistant(data: ChatAssistantRequest):
    user = g.user

    async def generate_response():
        async for mode, chunk in call_assistant_service(
            thread_id=user.id,
            user_msg=data.user_msg,
            trip=data.trip,
            categories=data.categories,
            uncategorized_items=data.uncategorized_items
        ):
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
                        messages=chunk["messages"],
                        trip=chunk["trip"],
                        categories=chunk["categories"],
                        uncategorized_items=chunk["uncategorized_items"]
                    )
                )
            
            if res:
                yield f"data: {res.model_dump_json()}\n\n"

        done_res = ChatAssistantResponse(
            done=True,
            mode=ChatAssistantResponseMode.MESSAGE,
            content=""
        )
        yield f"data: {done_res.model_dump_json()}\n\n"

    return Response(generate_response(), mimetype='text/event-stream')

@bp.route('/accept', methods=['POST'])
@login_required
@validate_request(AcceptAssistantRequest)
@validate_response(AcceptAssistantResponse, status_code=200)
async def accept_assistant(data: AcceptAssistantRequest):
    user = g.user
    
    # Prepare data for RPC
    trip_dict = data.trip.model_dump(mode='json')
    categories_dict = [c.model_dump(mode='json') for c in data.categories]
    uncategorized_items_dict = [i.model_dump(mode='json') for i in data.uncategorized_items]
    
    try:
        # Call the atomic postgres function
        res = await run_sync(g.supabase.rpc('accept_assistant_results', {
            'p_user_id': user.id,
            'p_trip': trip_dict,
            'p_categories': categories_dict,
            'p_uncategorized_items': uncategorized_items_dict
        }).execute)()
        
        trip_id = res.data
        
        return AcceptAssistantResponse(trip_id=trip_id)
        
    except Exception as e:
        abort(500, description="Failed to accept changes - " + e.message)
    