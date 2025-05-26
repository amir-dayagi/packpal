from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any

from app.utils.auth import require_auth
from app.utils.validations import validate_json



bp = Blueprint('items', __name__)

@bp.route('', methods=['POST'])
@require_auth
def create_item(user_id: str) -> tuple[Dict[str, Any], int]:
    """Create a new item"""    
    # Validate request body and get data
    err = validate_json(['trip_id','name', 'quantity'])
    if err:
        return err
    data = request.get_json()
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if trip exists
    trip = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('id', data['trip_id']) \
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
            'trip_id': data['trip_id'],
            'name': data['name'],
            'quantity': data['quantity'],
            'notes': data.get('notes', '')
        })\
        .execute()

    # Check if item was created
    if not item.data:
        return jsonify({'error': 'Failed to create item'}), 500
    
    # Return item
    return jsonify({'item': item.data[0]}), 201

@bp.route('/<item_id>', methods=['GET'])
@require_auth
def get_item(user_id: str, item_id: str) -> tuple[Dict[str, Any], int]:
    """Get a specific item"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get item
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('items.id', item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Item not found'}), 404
    
    # Return item
    return jsonify({'item': item.data[0]}), 200

@bp.route('/<item_id>', methods=['PUT'])
@require_auth
def update_item(user_id: str, item_id: str) -> tuple[Dict[str, Any], int]:
    """Update an item"""
    # Get request body
    data = request.get_json()

    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if item exists
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('items.id', item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Item not found'}), 404

    # Update item
    item = supabase_client\
        .table('items')\
        .update(data) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        return jsonify({'error': 'Failed to update item'}), 500
    
    # Return updated item
    return jsonify({'item': item.data[0]}), 200

@bp.route('/<item_id>', methods=['DELETE'])
@require_auth
def delete_item(user_id: str, item_id: str) -> tuple[Dict[str, str], int]:
    """Delete an item"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if item exists
    item = supabase_client\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('items.id', item_id) \
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
