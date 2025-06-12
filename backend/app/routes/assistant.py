from flask import Blueprint, request, jsonify, g, Response, current_app
from typing import Dict, Any, Generator
from supabase import create_client
from pydantic import ValidationError
import json

from app.utils.auth import require_auth
from app.models.assistant import AssistantChatRequest, AssistantProcessRequest, AssistantChangesRequest
from app.utils.assistant import chat_with_assistant, get_chat_history

bp = Blueprint('assistant', __name__, url_prefix='/assistant')

@bp.route('/chat-history/<trip_id>', methods=['GET'])
@require_auth
def get_assistant_chat_history(user_id: str, trip_id: str) -> tuple[Dict[str, Any], int]:
    """
    Get the assistant chat history for a trip
    
    Headers:
        Authorization: str. The token of the user

    Args:
        trip_id: str. The id of the trip

    Returns:
        chat_history: List[AssistantChatMessage]

    Errors:
        - 404: Trip not found
        - 500: Failed to get chat history
    """
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get trip
    trip = supabase_client\
        .table('trips')\
        .select('*')\
        .eq('id', trip_id)\
        .eq('user_id', user_id)\
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404

    # Get chat history
    try:
        chat_history = get_chat_history(trip_id, current_app.connection_pool)
        return jsonify({"chat_history": [chat.model_dump(exclude_none=True) for chat in chat_history]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['POST'])
@require_auth
def start_assistant_chat(user_id: str) -> tuple[Dict[str, Any], int]:
    """
    Start an assistant chat

    Headers:
        Authorization: str. The token of the user

    Body:
        message: str. The message to chat with the assistant
        trip: Trip. The trip to chat with the assistant
            id: str. The id of the trip
            name: str. The name of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip
            description: (optional) str. The description of the trip
        packing_list: List[Item]. The packing list to chat with the assistant
            id: str. The id of the item
            name: str. The name of the item
            quantity: int. The quantity of the item
            notes: (optional) str. The notes of the item

    Returns:
        assistant_process_id: str. The id of the assistant process

    Errors:
        - 400: Invalid request body
        - 404: Trip not found
        - 500: Failed to create assistant process
    """
    # Get assistant request data
    try:
        assistant_request = AssistantChatRequest(**request.get_json())
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get trip
    trip = supabase_client\
        .table('trips')\
        .select('*')\
        .eq('id', assistant_request.trip.id)\
        .eq('user_id', user_id)\
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404

    # Create assistant process
    assistant_process_request = AssistantProcessRequest(
        user_id=user_id,
        payload=assistant_request.model_dump_json()
    )
    assistant_process = supabase_client\
        .table('assistant_processes')\
        .insert(assistant_process_request.model_dump())\
        .execute()
    
    if not assistant_process.data:
        return jsonify({'error': 'Failed to create assistant process'}), 500

    return jsonify({'assistant_process_id': assistant_process.data[0]['id']}), 201

@bp.route('', methods=['GET'])
def assistant_chat() -> tuple[Dict[str, Any], int]:
    """
    Chat with the assistant

    Query:
        assistant_process_id: str. The id of the assistant process

    Returns:
        response: AssistantResponse. The response from the assistant
            message: str. The message sent by the assistant
            trip: Trip. The trip
                id: str. The id of the trip
                name: str. The name of the trip
                start_date: date. The start date of the trip
                end_date: date. The end date of the trip
                description: (optional) str. The description of the trip
            packing_list: List[Item]. The packing list
                id: str. The id of the item
                name: str. The name of the item
                quantity: int. The quantity of the item
                notes: (optional) str. The notes of the item

    Errors:
        - 400: Assistant process id is required
        - 500: Failed to chat with the assistant
    """
    # Get assistant process id
    assistant_process_id = request.args.get('assistant_process_id')
    if not assistant_process_id:
        return jsonify({'error': 'Assistant process id is required'}), 400

    # Create Supabase client
    supabase_client = create_client(
        current_app.config["SUPABASE_URL"],
        current_app.config["SUPABASE_KEY"],
    )
    if not supabase_client:
        return jsonify({'error': 'Failed to create Supabase client'}), 500
    
    # Get payload
    payload = supabase_client\
        .table('assistant_processes')\
        .select('payload')\
        .eq('id', assistant_process_id)\
        .execute()
    
    if not payload.data:
        return jsonify({'error': 'Assistant process not found'}), 404
    
    try:
        assistant_request = AssistantChatRequest(**json.loads(payload.data[0]['payload']))
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    
    connection_pool = current_app.connection_pool
    def generate_response() -> Generator[str, None, None]:
        for chunk in chat_with_assistant(assistant_request, connection_pool):
            yield f"data: {json.dumps(chunk.model_dump(exclude_none=True))}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return Response(generate_response(), mimetype='text/event-stream')

@bp.route('/accept-changes', methods=['POST'])
@require_auth
def accept_changes(user_id: str) -> tuple[Dict[str, Any], int]:
    """
    Accept changes made by the assistant

    Headers:
        Authorization: str. The token of the user

    Body:
        trip: Trip. The trip after the changes
            id: str. The id of the trip
            name: str. The name of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip
            description: (optional) str. The description of the trip
        packing_list: List[Item]. The packing list after the changes
            id: str. The id of the item
            name: str. The name of the item
            quantity: int. The quantity of the item
            notes: (optional) str. The notes of the item

    Returns:
        success: bool. Whether the changes were accepted successfully

    Errors:
        - 400: Invalid request body
        - 404: Assistant process not found
        - 500: Failed to accept changes
    """
    # Get request data
    try:
        data = request.get_json()
        changes = AssistantChangesRequest(**data)
    except (KeyError, ValidationError) as e:
        return jsonify({'error': str(e)}), 400
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get current trip
    trip = supabase_client\
        .table('trips')\
        .select('*')\
        .eq('id', changes.trip.id)\
        .eq('user_id', user_id)\
        .execute()
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404
    
    # Get current packing list
    packing_list = supabase_client\
        .table('items')\
        .select('*') \
        .eq('trip_id', changes.trip.id) \
        .order('created_at', desc=True) \
        .execute()
    if packing_list.data is None:
        return jsonify({'error': 'Packing list not found'}), 404
    
    
    # TODO: handle DB transactions for atomic updates

    # Update trip
    supabase_client\
        .table('trips')\
        .update(changes.trip.model_dump(exclude_none=True))\
        .eq('id', changes.trip.id)\
        .eq('user_id', user_id)\
        .execute()
    
    
    updates = []
    inserts = []
    deletes = []
    for item in changes.packing_list:        
        if item.id:
            item_data = item.model_dump()
            item_data['trip_id'] = changes.trip.id
            updates.append(item_data)
        else:
            item_data = item.model_dump(exclude_none=True)
            item_data['trip_id'] = changes.trip.id
            inserts.append(item_data)

    
    for item in packing_list.data:
        if item['id'] not in [i.id for i in changes.packing_list]:
            deletes.append(item['id'])

    # Update packing list
    if updates:
        supabase_client\
            .table('items')\
            .upsert(updates)\
            .execute()
    if inserts:
        supabase_client\
            .table('items')\
            .insert(inserts)\
            .execute()
    if deletes:
        supabase_client\
            .table('items')\
            .delete()\
            .in_('id', deletes)\
            .execute()
    
    return jsonify({'success': True}), 200