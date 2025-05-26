from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any

from app.utils.auth import require_auth
from app.utils.validations import validate_json

bp = Blueprint('suggested_items', __name__)

@bp.route('', methods=['POST'])
@require_auth
def create_suggested_item(user_id: str) -> tuple[Dict[str, Any], int]:
    """Create a new suggested item"""    
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

    # Create suggested item
    suggested_item = supabase_client\
        .table('suggested_items')\
        .insert({
            'trip_id': data['trip_id'],
            'name': data['name'],
            'quantity': data['quantity'],
            'reason': data['reason'],
            'notes': data.get('notes', '')
        })\
        .execute()

    # Check if suggested item was created
    if not suggested_item.data:
        return jsonify({'error': 'Failed to create suggested item'}), 500
    
    # Return suggested item
    return jsonify({'suggested_item': suggested_item.data[0]}), 201

@bp.route('/<suggested_item_id>', methods=['GET'])
@require_auth
def get_suggested_item(user_id: str, suggested_item_id: str) -> tuple[Dict[str, Any], int]:
    """Get a specific suggested item"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get suggested item
    suggested_item = supabase_client\
        .table('suggested_items')\
        .select('*', 'trips(user_id)') \
        .eq('suggested_items.id', suggested_item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not suggested_item.data:
        return jsonify({'error': 'Suggested item not found'}), 404
    
    # Return suggested item
    return jsonify({'suggested_item': suggested_item.data[0]}), 200

@bp.route('/<suggested_item_id>', methods=['DELETE'])
@require_auth
def delete_suggested_item(user_id: str, suggested_item_id: str) -> tuple[Dict[str, str], int]:
    """Delete a suggested item"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if suggested item exists
    suggested_item = supabase_client\
        .table('suggested_items')\
        .select('*', 'trips(user_id)') \
        .eq('suggested_items.id', suggested_item_id) \
        .eq('trips.user_id', user_id) \
        .execute()
    
    if not suggested_item.data:
        return jsonify({'error': 'Suggested item not found'}), 404
    
    # Delete suggested item
    suggested_item = supabase_client\
        .table('suggested_items')\
        .delete() \
        .eq('id', suggested_item_id) \
        .execute()
    
    if not suggested_item.data:
        return jsonify({'error': 'Failed to delete suggested item'}), 500

    # Successfuly deleted suggested item
    return jsonify({'message': 'Suggested item deleted successfully'}), 200
