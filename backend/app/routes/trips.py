from flask import Blueprint, request, jsonify, current_app, g
from typing import Dict, Any, List

from app.utils.auth import require_auth
from app.utils.validations import validate_json
from app.utils.suggestion import suggest_items

bp = Blueprint('trips', __name__)

@bp.route('', methods=['POST'])
@require_auth
def create_trip(user_id: str) -> tuple[Dict[str, Any], int]:
    """Create a new trip"""    
    # Validate request body and get data
    err = validate_json(['name', 'start_date', 'end_date'])
    if err:
        return err
    data = request.get_json()
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Create trip
    trip = supabase_client\
        .table('trips')\
        .insert({
            'user_id': user_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'start_date': data['start_date'],
            'end_date': data['end_date']
        })\
        .execute()

    # Check if trip was created
    if not trip.data:
        return jsonify({'error': 'Failed to create trip'}), 500
    
    # Suggest items using LLM if enabled
    if data.get('suggest_items', False):
        suggested_items = suggest_items(current_app.llm, trip.data[0])
        created_suggested_items = supabase_client\
            .table('suggested_items')\
            .insert(suggested_items)\
            .execute()
        
        # Check if suggested items were created
        if not created_suggested_items.data:
            return jsonify({'error': 'Failed to create suggested items'}), 500

        # Return trip and suggested items
        return jsonify({'trip': trip.data[0], 'suggested_items': created_suggested_items.data}), 201

    # Return trip without suggested items
    return jsonify({'trip': trip.data[0]}), 201
    
    
@bp.route('', methods=['GET'])
@require_auth
def get_trips(user_id: str) -> tuple[Dict[str, List[Dict[str, Any]]], int]:
    """Get all trips for the current user"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get trips
    trips = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('user_id', user_id) \
        .execute()

    print('trips', trips)
    
    # Return trips
    return jsonify({'trips': trips.data}), 200


@bp.route('/<trip_id>', methods=['GET'])
@require_auth
def get_trip(user_id: str, trip_id: str) -> tuple[Dict[str, Any], int]:
    """Get a specific trip"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get trip
    trip = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404
    
    # Return trip
    return jsonify({'trip': trip.data[0]}), 200


@bp.route('/<trip_id>/items', methods=['GET'])
@require_auth
def get_trip_items(user_id: str, trip_id: str) -> tuple[Dict[str, List[Dict[str, Any]]], int]:
    """Get all items for a specific trip"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if trip exists
    trip = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404

    #  Get items
    items = supabase_client\
        .table('items')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .execute()
    
    # Return items
    return jsonify({'items': items.data}), 200


@bp.route('/<trip_id>/suggested-items', methods=['GET'])
@require_auth
def get_trip_suggested_items(user_id: str, trip_id: str) -> tuple[Dict[str, List[Dict[str, Any]]], int]:
    """Get all suggested items for a specific trip"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Check if trip exists
    trip = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404
    
    # Get suggested items
    suggested_items = supabase_client\
        .table('suggested_items')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .execute()
    
    # Return suggested items
    return jsonify({'suggested_items': suggested_items.data}), 200

@bp.route('/<trip_id>', methods=['DELETE'])
@require_auth
def delete_trip(user_id: str, trip_id: str) -> tuple[Dict[str, str], int]:
    """Delete a trip"""
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Delete trip
    trip = supabase_client\
        .table('trips')\
        .delete() \
        .eq('id', trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Failed to delete trip'}), 500

    # Successfuly deleted trip
    return jsonify({'message': 'Trip deleted successfully'}), 200

