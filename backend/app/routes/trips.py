from datetime import date
from quart import Blueprint, g, abort
from quart.utils import run_sync
from quart_schema import validate_request, validate_response, validate_querystring

from ..models.category import CategoriesResponse
from ..models.item import ItemsResponse
from ..models.message_response import MessageResponse
from ..models.trip import CreateTripRequest, TripResponse, TripStatusQuery, TripsResponse, UpdateTripRequest
from ..utils.auth import login_required

bp = Blueprint('trips', __name__, url_prefix='/trips')

@bp.route('', methods=['GET'])
@login_required
@validate_querystring(TripStatusQuery)
@validate_response(TripsResponse, status_code=200)
async def get_trips(query_args: TripStatusQuery):
    """Get all trips for the current user with a specific status if given"""
    user = g.user

    # Get trips
    trips_query = g.supabase \
        .table('trips') \
        .select('*')

    status_filter = []
    if query_args.packing:
        status_filter.append('packing')
    if query_args.traveling:
        status_filter.append('traveling')
    if query_args.completed:
        status_filter.append('completed')
    
    trips = await run_sync(trips_query.eq('user_id', user.id) \
        .in_('status', status_filter) \
        .order('created_at', desc=True) \
        .execute)()
    
    # Return trips
    return TripsResponse(trips=trips.data)

@bp.route('/<trip_id>', methods=['GET'])
@login_required
@validate_response(TripResponse, status_code=200)
async def get_trip(trip_id: str):
    """Get a specific trip for the current user"""
    user = g.user

    # Get trip
    trip = await run_sync(g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute)()

    if not trip.data:
        abort(404, "Trip not found")

    # Return trip
    return TripResponse(trip=trip.data[0])

@bp.route('', methods=['POST'])
@login_required
@validate_request(CreateTripRequest)
@validate_response(TripResponse, status_code=201)
async def create_trip(data: CreateTripRequest):
    """Create a new trip for the current user"""
    user = g.user

    # Validate dates
    try:
        start_date = date.fromisoformat(data.start_date)
        end_date = date.fromisoformat(data.end_date)
        if start_date < date.today():
            abort(400, "Start date cannot be in the past")
        if start_date > end_date:
            abort(400, "Start date must be smaller or equal to end date")
    except ValueError as e:
        abort(400, "Invalid date - " + str(e))

    # Create new trip dictionary
    new_trip = {
        "user_id": user.id,
        "name": data.name,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "description": data.description
    }

    # Create trip
    trip = await run_sync(g.supabase\
        .table('trips')\
        .insert(new_trip)\
        .execute)()

    # Check if trip was created
    if not trip.data:
        abort(500, description="Failed to create trip")
    
    # Return trip
    return TripResponse(trip=trip.data[0])

@bp.route('/<trip_id>', methods=['PUT'])
@login_required
@validate_request(UpdateTripRequest)
@validate_response(TripResponse, status_code=200)
async def update_trip(trip_id: str, data: UpdateTripRequest):
    """Update a specific trip for the current user"""
    user = g.user

    # Check if trip exists
    trip = await run_sync(g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute)()
    
    if not trip.data:
        abort(404, "Trip not found")
    
    # Validate dates
    try:
        date.fromisoformat(data.start_date if data.start_date else trip.data[0]['start_date'])
        date.fromisoformat(data.end_date if data.end_date else trip.data[0]['end_date'])
    except ValueError as e:
        abort(400, "Invalid date - " + str(e))

    # Create updated trip dictionary
    updated_trip = data.model_dump(exclude_none=True)

    # Update trip
    trip = await run_sync(g.supabase\
        .table('trips')\
        .update(updated_trip) \
        .eq('id', trip_id) \
        .execute)()
    
    if not trip.data:
        abort(500, description="Failed to update trip")
    
    # Return updated trip
    return TripResponse(trip=trip.data[0])

@bp.route('/<trip_id>', methods=['DELETE'])
@login_required
@validate_response(MessageResponse, status_code=200)
async def delete_trip(trip_id: str):
    """Delete a specific trip for the current user"""
    user = g.user

    # Delete trip
    trip = await run_sync(g.supabase\
        .table('trips')\
        .delete() \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute)() 

    if not trip.data:
        abort(500, description="Failed to delete trip")
    
    return MessageResponse(message="Trip deleted successfully")

@bp.route('/<trip_id>/items', methods=['GET'])
@login_required
@validate_response(ItemsResponse, status_code=200)
async def get_trip_items(trip_id: str):
    """Get all the items associated with a specific trip"""
    user = g.user

    # Check if trip exists
    trip = await run_sync(g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute)()
    
    if not trip.data:
        abort(404, "Trip not found")

    #  Get items
    items = await run_sync(g.supabase\
        .table('items')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .order('id') \
        .execute)()
    
    return ItemsResponse(items=items.data)

@bp.route('/<trip_id>/categories', methods=['GET'])
@login_required
@validate_response(CategoriesResponse, status_code=200)
async def get_trip_categories(trip_id: str):
    """Get all the categories associated with a specific trip"""
    user = g.user

    # Check if trip exists
    trip = await run_sync(g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', trip_id) \
        .eq('user_id', user.id) \
        .execute)()
    
    if not trip.data:
        abort(404, "Trip not found")

    #  Get categories
    categories = await run_sync(g.supabase\
        .table('categories')\
        .select('*') \
        .eq('trip_id', trip_id) \
        .order('id') \
        .execute)()
    
    return CategoriesResponse(categories=categories.data)