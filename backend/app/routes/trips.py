from flask import Blueprint, request, jsonify, g
import json
from typing import Dict, Any, List
from pydantic import ValidationError

from app.utils.auth import require_auth
from app.models.trip import CreateTripRequest, UpdateTripRequest, Trip
from app.models.item import Item

bp = Blueprint('trips', __name__, url_prefix='/trips')

@bp.route('', methods=['GET'])
@require_auth
def get_trips(user_id: str) -> tuple[Dict[str, List[Dict[str, Any]]], int]:
    """
    Get all trips for the current user
    
    Headers:
        Authorization: str. The token of the user

    Returns:
        trips: List[Trip]
            id: str. The id of the trip
            user_id: str. The id of the user who created the trip
            created_at: datetime. The date and time the trip was created
            name: str. The name of the trip
            description: (optional) str. The description of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip

    Errors:
        - 500: Failed to get trips
    """
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Get trips
    trips = supabase_client\
        .table('trips')\
        .select('*') \
        .eq('user_id', user_id) \
        .order('start_date', desc=True) \
        .execute() \
    
    # Assert trips are valid
    try:
        trips = [Trip.model_validate(trip).model_dump() for trip in trips.data]
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return trips
    return jsonify({'trips': trips}), 200


@bp.route('/<trip_id>', methods=['GET'])
@require_auth
def get_trip(user_id: str, trip_id: str) -> tuple[Dict[str, Any], int]:
    """
    Get a specific trip
    
    Headers:
        Authorization: str. The token of the user

    Args:
        trip_id: str. The id of the trip

    Returns:
        trip:
            id: str. The id of the trip
            user_id: str. The id of the user who created the trip
            created_at: datetime. The date and time the trip was created
            name: str. The name of the trip
            description: (optional) str. The description of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip

    Errors:
        - 404: Trip not found
        - 500: Failed to get trip
    """
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
    
    # Assert trip is valid
    try:
        trip = Trip.model_validate(trip.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return trip
    return jsonify({'trip': trip}), 200


@bp.route('', methods=['POST'])
@require_auth
def create_trip(user_id: str) -> tuple[Dict[str, Any], int]:
    """
    Create a new trip
    
    Headers:
        Authorization: str. The token of the user

    Body:
        name: str. The name of the trip
        description: (optional) str. The description of the trip
        start_date: date. The start date of the trip
        end_date: date. The end date of the trip
    
    Returns:
        trip:
            id: str. The id of the trip
            user_id: str. The id of the user who created the trip
            created_at: datetime. The date and time the trip was created
            name: str. The name of the trip
            description: (optional) str. The description of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip

    Errors:
        - 400: Invalid request body
        - 500: Failed to create trip
    """    
    # Get trip request data
    try:
        trip_request = CreateTripRequest(**request.get_json())
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    
    # Get Supabase client
    supabase_client = g.supabase
    if not supabase_client:
        return jsonify({'error': 'Supabase client not initialized'}), 500
    
    # Add user id to trip data
    trip_data = trip_request.model_dump(exclude_none=True)
    trip_data['user_id'] = user_id

    # Create trip
    trip = supabase_client\
        .table('trips')\
        .insert(trip_data)\
        .execute()

    # Check if trip was created
    if not trip.data:
        return jsonify({'error': 'Failed to create trip'}), 500
    
    # Assert trip is valid
    try:
        trip = Trip.model_validate(trip.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return trip
    return jsonify({'trip': trip}), 201


@bp.route('/<trip_id>', methods=['PUT'])
@require_auth
def update_trip(user_id: str, trip_id: str) -> tuple[Dict[str, Any], int]:
    """
    Update a trip
    
    Headers:
        Authorization: str. The token of the user

    Args:
        trip_id: str. The id of the trip

    Body:
        name: (optional) str. The new name of the trip
        description: (optional) str. The new description of the trip
        start_date: (optional) date. The new start date of the trip
        end_date: (optional) date. The new end date of the trip
    
    Returns:
        trip:
            id: str. The id of the trip
            user_id: str. The id of the user who created the trip
            created_at: datetime. The date and time the trip was created
            name: str. The name of the trip
            description: (optional) str. The description of the trip
            start_date: date. The start date of the trip
            end_date: date. The end date of the trip

    Errors:
        - 400: Invalid request body
        - 404: Trip not found
        - 500: Failed to update trip
    """
    # Get trip request data
    try:
        trip_request = UpdateTripRequest(**request.get_json())
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
        .eq('id', trip_id) \
        .eq('user_id', user_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Trip not found'}), 404

    # Update trip
    updated_trip = trip_request.model_dump(exclude_none=True)
    updated_trip['id'] = trip_id
    trip = supabase_client\
        .table('trips')\
        .update(updated_trip) \
        .eq('id', trip_id) \
        .execute()
    
    if not trip.data:
        return jsonify({'error': 'Failed to update trip'}), 500
    
    # Assert trip is valid
    try:
        trip = Trip.model_validate(trip.data[0]).model_dump()
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return updated trip
    return jsonify({'trip': trip}), 200
    
    
@bp.route('/<trip_id>/packing-list', methods=['GET'])
@require_auth
def get_packing_list(user_id: str, trip_id: str) -> tuple[Dict[str, List[Dict[str, Any]]], int]:
    """
    Get all items for a specific trip's packing list
    
    Headers:
        Authorization: str. The token of the user

    Args:
        trip_id: str. The id of the trip

    Returns:
        packing_list: List[Item]
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
        - 404: Trip not found
        - 500: Failed to get items
    """
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
        .order('created_at', desc=True) \
        .execute()
    
    # Assert items are valid
    try:
        items = [Item.model_validate(item).model_dump() for item in items.data]
    except ValidationError as e:
        return jsonify({'error': str(e)}), 500
    
    # Return items
    return jsonify({'packing_list': items}), 200



@bp.route('/<trip_id>', methods=['DELETE'])
@require_auth
def delete_trip(user_id: str, trip_id: str) -> tuple[Dict[str, str], int]:
    """
    Delete a trip
    
    Headers:
        Authorization: str. The token of the user

    Args:
        trip_id: str. The id of the trip

    Returns:
        message: str. The message that the trip was deleted successfully

    Errors:
        - 404: Trip not found
        - 500: Failed to delete trip
    """
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
