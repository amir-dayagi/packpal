from datetime import date
from apiflask import APIBlueprint, abort
from ..models.category import CategoriesResponse
from ..models.item import ItemsResponse
from ..models.message_response import MessageResponse
from ..utils.auth import auth
from flask import g
from ..models.trip import CreateTripRequest, TripResponse, TripStatusQuery, TripsResponse, UpdateTripRequest

bp = APIBlueprint('trips', __name__, url_prefix='/trips')

@bp.get('')
@auth.login_required
@bp.input(TripStatusQuery, location="query")
@bp.output(TripsResponse, status_code=200)
def get_trips(query_data: TripStatusQuery):
    """Get all trips for the current user with a specific status if given"""
    # Get user
    user = auth.current_user

    # Get trips
    trips = g.supabase \
        .table('trips') \
        .select('*')

    status_filter = []
    if query_data.packing:
        status_filter.append('packing')
    if query_data.traveling:
        status_filter.append('traveling')
    if query_data.completed:
        status_filter.append('completed')
    
    trips = trips.eq('user_id', user.id) \
        .in_('status', status_filter) \
        .order('created_at', desc=True) \
        .execute()
    
    print(trips.data)

    # Return trips
    return TripsResponse(trips=trips.data)

@bp.get('/<trip_id>')
@auth.login_required
@bp.output(TripResponse, status_code=200)
def get_trip(trip_id: str):
    """Get a specific trip for the current user"""
    # Get user
    user = auth.current_user

    # Get trip
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute()

    if not trip.data:
        abort(404, message="Trip not found")

    # Return trip
    return TripResponse(trip=trip.data[0])

@bp.post('')
@auth.login_required
@bp.input(CreateTripRequest, location='json')
@bp.output(TripResponse, status_code=201)
def create_trip(json_data: CreateTripRequest):
    """Create a new trip for the current user"""
    # Get user
    user = auth.current_user

    # Validate dates
    try:
        start_date = date.fromisoformat(json_data.start_date)
        end_date = date.fromisoformat(json_data.end_date)
        if start_date < date.today():
            abort(400, message="Start date cannot be in the past")
        if start_date > end_date:
            abort(400, message="Start date must be smaller or equal to end date")
    except ValueError as e:
        abort(400, message="Invalid date - " + str(e))

    # Create new trip dictionary
    new_trip = {
        "user_id": user.id,
        "name": json_data.name,
        "start_date": json_data.start_date,
        "end_date": json_data.end_date,
        "description": json_data.description
    }

    # Create trip
    trip = g.supabase\
        .table('trips')\
        .insert(new_trip)\
        .execute()

    # Check if trip was created
    if not trip.data:
        return abort(500, message="Failed to create trip")
    
    # Return trip
    return TripResponse(trip=trip.data[0])

@bp.put('/<trip_id>')
@auth.login_required
@bp.input(UpdateTripRequest, location='json')
@bp.output(TripResponse, status_code=200)
def update_trip(trip_id: str, json_data: UpdateTripRequest):
    """Update a specific trip for the current user"""
    # Get user
    user = auth.current_user

    # Check if trip exists
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, message="Trip not found")
    
    # Validate dates
    try:
        start_date = date.fromisoformat(json_data.start_date if json_data.start_date else trip.data[0]['start_date'])
        end_date = date.fromisoformat(json_data.end_date if json_data.end_date else trip.data[0]['end_date'])
    except ValueError as e:
        abort(400, message="Invalid date - " + str(e))

    # Create updated trip dictionary
    updated_trip = json_data.model_dump(exclude_none=True)

    # Update trip
    trip = g.supabase\
        .table('trips')\
        .update(updated_trip) \
        .eq('id', trip_id) \
        .execute()
    
    if not trip.data:
        abort(500, message="Failed to update trip")
    
    # Return updated trip
    return TripResponse(trip=trip.data[0])

@bp.delete('/<trip_id>')
@auth.login_required
@bp.output(MessageResponse, status_code=200)
def delete_trip(trip_id: str):
    """Delete a specific trip for the current user"""
    # Get user
    user = auth.current_user

    # Delete trip
    trip = g.supabase\
        .table('trips')\
        .delete() \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute() 

    if not trip.data:
        abort(500, message="Failed to delete trip")
    
    return MessageResponse(message="Trip deleted successfully")

@bp.get('/<trip_id>/items')
@auth.login_required
@bp.output(ItemsResponse, status_code=200)
def get_trip_items(trip_id: str):
    """Get all the items associated with a specific trip"""
    # Get user
    user = auth.current_user

    # Check if trip exists
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, 'Trip not found')

    #  Get items
    items = g.supabase\
        .table('items')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .order('id') \
        .execute()
    
    return ItemsResponse(items=items.data)

@bp.get('/<trip_id>/categories')
@auth.login_required
@bp.output(CategoriesResponse, status_code=200)
def get_trip_categories(trip_id: str):
    """Get all the categories associated with a specific trip"""
    # Get user
    user = auth.current_user

    # Check if trip exists
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, 'Trip not found')

    #  Get categories
    categories = g.supabase\
        .table('categories')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .order('id') \
        .execute()
    
    return CategoriesResponse(categories=categories.data)