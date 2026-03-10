from quart import Blueprint, g, abort
from quart_schema import validate_request, validate_response

from ..models.item import CreateItemRequest, ItemOrigin, ItemResponse, PackedRequest, UpdateItemRequest, ReturningRequest
from ..models.message_response import MessageResponse
from ..utils.auth import login_required

bp = Blueprint('items', __name__, url_prefix='/items')

@bp.route('/<item_id>', methods=['GET'])
@login_required
@validate_response(ItemResponse, status_code=200)
async def get_item(item_id: str):
    """Get a specific item for the current user"""
    user = g.user

    # Get item
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()

    if not item.data:
        abort(404, "Item not found")

    # Return item
    return ItemResponse(item=item.data[0])

@bp.route('/<item_id>', methods=['DELETE'])
@login_required
@validate_response(MessageResponse, status_code=200)
async def delete_item(item_id: str):
    """Delete a specific item for the current user"""
    user = g.user

    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")
    
    # Delete item
    item = await g.supabase\
        .table('items')\
        .delete() \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to delete item")

    return MessageResponse(message="Item deleted successfully")
    
@bp.route('', methods=['POST'])
@login_required
@validate_request(CreateItemRequest)
@validate_response(ItemResponse, status_code=201)
async def create_item(data: CreateItemRequest):
    """Create a new item and add it to the desired section and category"""
    user = g.user

    # Check if trip exists
    trip = await g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', data.trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, "Trip not found")
    
    # Create new_item dictionary
    quantity_destination = "list_quantity" if data.origin == ItemOrigin.LISTED else "purchased_quantity"
    new_item = {
        "trip_id": data.trip_id,
        "name": data.name,
        quantity_destination: data.quantity if data.quantity else 1,
        "notes": data.notes,
        "origin": data.origin,
        "category_id": data.category_id
    }
    
    # Create item
    item = await g.supabase\
        .table('items')\
        .insert(new_item)\
        .execute()

    if not item.data:
        abort(500, description="Failed to create item")
    
    # Return item
    return ItemResponse(item=item.data[0])

@bp.route('/<item_id>', methods=['PUT'])
@login_required
@validate_request(UpdateItemRequest)
@validate_response(ItemResponse, status_code=200)
async def update_item(item_id: str, data: UpdateItemRequest):
    """Update the item's name, quantity, notes, or category"""
    user = g.user
    
    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")

    # Create updated_item dictionary
    updated_item = dict()
    if data.name:
        updated_item['name'] = data.name
    if data.quantity:
        updated_item['list_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'] = data.quantity
    if data.notes:
        updated_item['notes'] = data.notes
    if data.category_id:
        updated_item['category_id'] = data.category_id

    # Update item
    item = await g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to update item")
    
    return ItemResponse(item=item.data[0])
  
@bp.route('/<item_id>/mark-as-packed', methods=['PUT'])
@login_required
@validate_request(PackedRequest)
@validate_response(ItemResponse, status_code=200)
async def mark_as_packed(item_id: str, data: PackedRequest):
    """Mark item as packed by updating its quantities (specifically "list_quantity" and "packed_quantity")"""
    user = g.user
    
    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")
    
    # Get current quantities
    current_list_quantity = item.data[0]['list_quantity']
    current_packed_quantity = item.data[0]['packed_quantity'] if item.data[0]['packed_quantity'] else 0
    
    if not current_list_quantity:
        abort(400, "Cannot mark item as packed if it is not in the list section")

    if data.is_entire_quantity:
        updated_item = {
            'list_quantity': None,
            'packed_quantity': current_packed_quantity + current_list_quantity
        }
    else:
        # check that the quantity is provided and is less than or equal to the list quantity
        if not data.quantity or current_list_quantity < data.quantity:
            abort(400, "Cannot mark item as packed because quantity was either not provided or it was too large")
        
        updated_item = {
            'list_quantity': current_list_quantity - data.quantity,
            'packed_quantity': current_packed_quantity + data.quantity
        }

    # Update item
    item = await g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to update item")
    
    return ItemResponse(item=item.data[0])

@bp.route('/<item_id>/mark-as-returning', methods=['PUT'])
@login_required
@validate_request(ReturningRequest)
@validate_response(ItemResponse, status_code=200)
async def mark_as_returning(item_id: str, data: ReturningRequest):
    """Mark item as returning by updating its quantities (specifically "packed_quantity" or "purchased_quantity" and "returning_quantity")"""
    user = g.user
    
    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")
    
    # Get current quantities
    origin = 'packed_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'
    current_origin_quantity = item.data[0][origin]
    current_returning_quantity = item.data[0]['returning_quantity'] if item.data[0]['returning_quantity'] else 0

    
    if not current_origin_quantity:
        abort(400, "Cannot mark item as returning if it is not in the packed or purchased sections")

    if data.is_entire_quantity:
        updated_item = {
            origin: None,
            'returning_quantity': current_returning_quantity + current_origin_quantity
        }
    else:
        # check that the quantity is provided and is less than or equal to the origin quantity
        if not data.quantity or current_origin_quantity < data.quantity:
            abort(400, "Cannot mark item as returning because quantity was either not provided or it was too large")
        
        updated_item = {
            origin: current_origin_quantity - data.quantity,
            'returning_quantity': current_returning_quantity + data.quantity
        }

    # Update item
    item = await g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to update item")
    
    return ItemResponse(item=item.data[0])

@bp.route('/<item_id>/unmark-as-packed', methods=['PUT'])
@login_required
@validate_request(PackedRequest)
@validate_response(ItemResponse, status_code=200)
async def unmark_as_packed(item_id: str, data: PackedRequest):
    """Unmark item as packed by updating its quantities (specifically "list_quantity" and "packed_quantity")"""
    user = g.user
    
    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")
    
    # Get current quantities
    current_packed_quantity = item.data[0]['packed_quantity'] 
    current_list_quantity = item.data[0]['list_quantity'] if item.data[0]['list_quantity'] else 0
    
    if not current_packed_quantity:
        abort(400, "Cannot unmark item as packed if it is not in the packed section")

    if data.is_entire_quantity:
        updated_item = {
            'list_quantity': current_list_quantity + current_packed_quantity,
            'packed_quantity': None
        }
    else:
        # check that the quantity is provided and is less than or equal to the packed quantity
        if not data.quantity or current_packed_quantity < data.quantity:
            abort(400, "Cannot unmark item as packed because quantity was either not provided or it was too large")
        
        updated_item = {
            'list_quantity': current_list_quantity + data.quantity,
            'packed_quantity': current_packed_quantity - data.quantity
        }

    # Update item
    item = await g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to update item")
    
    return ItemResponse(item=item.data[0])

@bp.route('/<item_id>/unmark-as-returning', methods=['PUT'])
@login_required
@validate_request(ReturningRequest)
@validate_response(ItemResponse, status_code=200)
async def unmark_as_returning(item_id: str, data: ReturningRequest):
    """Unmark item as returning by updating its quantities (specifically "packed_quantity" or "purchased_quantity" and "returning_quantity")"""
    user = g.user
    
    # Check if item exists
    item = await g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, "Item not found")
    
    # Get current quantities
    current_returning_quantity = item.data[0]['returning_quantity']
    origin = 'packed_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'
    current_origin_quantity = item.data[0][origin] if item.data[0][origin] else 0

    
    if not current_returning_quantity:
        abort(400, "Cannot unmark item as returning if it is not in the returning section")

    if data.is_entire_quantity:
        updated_item = {
            origin: current_origin_quantity + current_returning_quantity,
            'returning_quantity': None
        }
    else:
        # check that the quantity is provided and is less than or equal to the returning quantity
        if not data.quantity or current_returning_quantity < data.quantity:
            abort(400, "Cannot unmark item as returning because quantity was either not provided or it was too large")
        
        updated_item = {
            origin: current_origin_quantity + data.quantity,
            'returning_quantity': current_returning_quantity - data.quantity
        }

    # Update item
    item = await g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, description="Failed to update item")
    
    return ItemResponse(item=item.data[0])