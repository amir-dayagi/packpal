from flask import Blueprint, request, jsonify, g
from typing import Dict, Any
from pydantic import ValidationError

from app.utils.auth import require_auth
from app.models.item import CreateItemRequest, UpdateItemRequest, Item


bp = Blueprint('items', __name__, url_prefix='/items')

@bp.route('', methods=['POST'])
@require_auth
def create_item(user_id: str) -> tuple[Dict[str, Any], int]:
    """
    Create a new item
    
    Headers:
        Authorization: str. The token of the user

    Body:
        trip_id: str. The id of the trip the item belongs to
        name: str. The name of the item
        quantity: int. The quantity of the item
        notes: (optional) str. The notes of the item 
    
    Returns:
        item:
            id: str. The id of the created item
            user_id: str. The id of the user who created the item
            trip_id: str. The id of the trip the item belongs to
            created_at: datetime. The date and time the item was created
            name: str. The name of the item
            quantity: int. The quantity of the item
            notes: (optional) str. The notes of the item 
            is_packed: bool. Whether the item is packed
            is_returning: bool. Whether the item is returning

    Errors:
        - 400: Invalid request body
        - 404: Trip not found
        - 403: User does not own the trip
        - 500: Failed to create item
    """    
    # Get item request data
    try:
        item_request = CreateItemRequest(**request.get_json())
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if trip exists
    trip = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('id', item_request.trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404
    
    # Check if user owns the trip
    if trip.data[0]['user_id'] != user_id:
        return jsonify({'error': 'User does not own the trip'}), 403

    # Create item
    item = supabase_client\
        .table('items')\
        .insert({
            'trip_id': item_request.trip_id,
            'name': item_request.name,
            'quantity': item_request.quantity,
            'notes': item_request.notes
        })\
        .execute()

    # Check if item was created
    if not item.data:
        return jsonify({'error': 'Failed to create item'}), 500
    
    # Assert item is valid
    try:
        item = Item.model_validate(item.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return item
    return jsonify({'item': item}), 201

@bp.route('/<item_id>', methods=['GET'])
@require_auth
def get_item(user_id: str, item_id: str) -> tuple[Dict[str, Any], int]:
    """
    Get a specific item
    
    Headers:
        Authorization: str. The token of the user

    Args:
        item_id: str. The id of the item
    
    Returns:
        item:
            id: str. The id of the item
            user_id: str. The id of the user who created the item
            trip_id: str. The id of the trip the item belongs to
            created_at: datetime. The date and time the item was created
            name: str. The name of the item
            quantity: int. The quantity of the item
            notes: (optional) str. The notes of the item
            is_packed: bool. Whether the item is packed
            is_returning: bool. Whether the item is returning
    
    Errors: 
        - 404: Item not found
        - 500: Failed to get item
    """
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get item
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Item not found'}), 404
    
    # Assert item is valid
    try:
        item = Item.model_validate(item.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return item
    return jsonify({'item': item}), 200

@bp.route('/<item_id>', methods=['PUT'])
@require_auth
def update_item(user_id: str, item_id: str) -> tuple[Dict[str, Any], int]:
    """
    Update an item
    If quantity is 0, the item is deleted
    
    Headers:
        Authorization: str. The token of the user

    Args:
        item_id: str. The id of the item

    Body:
        name: (optional) str. The new name of the item
        quantity: (optional) int. The new quantity of the item
        notes: (optional) str. The new notes of the item
        is_packed: (optional) bool. Whether the item is now packed
        is_returning: (optional) bool. Whether the item is now returning
    
    Returns:
        item:
            id: str. The id of the item
            user_id: str. The id of the user who created the item
            trip_id: str. The id of the trip the item belongs to
            created_at: datetime. The date and time the item was created
            name: str. The name of the item
            quantity: int. The quantity of the item
            notes: (optional) str. The notes of the item
    """
    # Get item request data
    try:
        item_request = UpdateItemRequest(**request.get_json())
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400

    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500


    # Check if item exists
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Item not found'}), 404

    # Delete item if quantity is 0
    if item_request.quantity == 0:
        supabase_client\
            .table('items')\
            .delete() \
            .eq('id', item_id) \
            .execute()
        
        if not item.data:
            return jsonify({'error': 'Failed to delete item'}), 500

        # Successfuly deleted item
        return jsonify({'message': 'Item deleted successfully'}), 200

    # Update item
    updated_item = item_request.model_dump(exclude_none=True)
    updated_item['id'] = item_id  # Ensure the ID is included for the update
    item = supabase_client\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Failed to update item'}), 500
    
    # Assert item is valid  
    try:
        item = Item.model_validate(item.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return updated item
    return jsonify({'item': item}), 200

@bp.route('/<item_id>', methods=['DELETE'])
@require_auth
def delete_item(user_id: str, item_id: str) -> tuple[Dict[str, str], int]:
    """
    Delete an item
    
    Headers:
        Authorization: str. The token of the user

    Args:
        item_id: str. The id of the item
    
    Returns:
        message: str. The message that the item was deleted successfully
    
    Errors:
        - 404: Item not found
        - 500: Failed to delete item
    """
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if item exists
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Item not found'}), 404
    
    # Delete item
    item = supabase_client\
        .table('items')\
        .delete() \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Failed to delete item'}), 500

    # Successfuly deleted item
    return jsonify({'message': 'Item deleted successfully'}), 200
