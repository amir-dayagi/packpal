from apiflask import APIBlueprint, abort
from ..models.message_response import MessageResponse
from ..utils.auth import auth
from flask import g
from ..models.item import CreateItemRequest, ItemOrigin, ItemResponse, PackedRequest, PackedRequest, UpdateItemRequest, ReturningRequest

bp = APIBlueprint('items', __name__, url_prefix='/items')

@bp.get('/<item_id>')
@auth.login_required
@bp.output(ItemResponse, status_code=200)
def get_item(item_id: str):
    """Get a specific item for the current user"""
    # Get user
    user = auth.current_user

    # Get item
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()

    if not item.data:
        abort(404, message="Item not found")

    # Return item
    return ItemResponse(item=item.data[0])

@bp.delete('/<item_id>')
@auth.login_required
@bp.output(MessageResponse, status_code=200)
def delete_item(item_id: str):
    """Delete a specific item for the current user"""
    # Get user
    user = auth.current_user

    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')
    
    # Delete item
    item = g.supabase\
        .table('items')\
        .delete() \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, 'Failed to delete item')

    return MessageResponse(message='Item deleted successfully')
    
@bp.post('')
@auth.login_required
@bp.input(CreateItemRequest, location='json')
@bp.output(ItemResponse, status_code=201)
def create_item(json_data: CreateItemRequest):
    """Create a new item and add it to the desired section and category"""
    # Get user
    user = auth.current_user

    # Check if trip exists
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', json_data.trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, message="Trip not found")
    
    # Check if user owns the trip
    if trip.data[0]['user_id'] != user.id:
        abort(400, message="User does not own the trip")

    
    # Create new_item dictionary
    quantity_destination = "list_quantity" if json_data.origin == ItemOrigin.LISTED else "purchased_quantity"
    new_item = {
        "trip_id": json_data.trip_id,
        "name": json_data.name,
        quantity_destination: json_data.quantity if json_data.quantity else 1,
        "notes": json_data.notes,
        "origin": json_data.origin,
        "category_id": json_data.category_id
    }
    
    # Create item
    item = g.supabase\
        .table('items')\
        .insert(new_item)\
        .execute()

    if not item.data:
        abort(500, message="Failed to create item")
    
    # Return item
    return ItemResponse(item=item.data[0])
    """Create a new item and add it to the purchased section"""
    # Get user
    user = auth.current_user

    # Check if trip exists
    trip = g.supabase\
        .table('trips')\
        .select('*') \
        .eq('id', json_data.trip_id) \
        .eq('user_id', user.id) \
        .execute()
    
    if not trip.data:
        abort(404, message="Trip not found")
    
    # Check if user owns the trip
    if trip.data[0]['user_id'] != user.id:
        abort(400, message="User does not own the trip")
    
    # Create new_item dictionary
    new_item = {
        "trip_id": json_data.trip_id,
        "name": json_data.name,
        "purchased_quantity": json_data.quantity if json_data.quantity else 1,
        "notes": json_data.notes
    }
    
    # Create item
    item = g.supabase\
        .table('items')\
        .insert(new_item)\
        .execute()

    if not item.data:
        abort(500, message="Failed to create item")
    
    # Return item
    return ItemResponse(item=item.data[0])

@bp.put('/<item_id>')
@auth.login_required
@bp.input(UpdateItemRequest, location='json')
@bp.output(ItemResponse, status_code=200)
def update_item(item_id: str, json_data: UpdateItemRequest):
    """Update the item's name, quantity, notes, or category"""
    # Get user
    user = auth.current_user
    
    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')

    # Create updated_item dictionary
    updated_item = dict()
    if json_data.name:
        updated_item['name'] = json_data.name
    if json_data.quantity:
        updated_item['list_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'] = json_data.quantity
    if json_data.notes:
        updated_item['notes'] = json_data.notes
    if json_data.category_id:
        updated_item['category_id'] = json_data.category_id

    # Update item
    item = g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, message='Failed to update item')
    
    return ItemResponse(item=item.data[0])
  
@bp.put('/<item_id>/mark-as-packed')
@auth.login_required
@bp.input(PackedRequest, location='json')
@bp.output(ItemResponse, status_code=200)
def mark_as_packed(item_id: str, json_data: PackedRequest):
    """Mark item as packed by updating its quantities (specifically "list_quantity" and "packed_quantity")"""
    # Get user
    user = auth.current_user
    
    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')
    
    # Get current quantities
    current_list_quantity = item.data[0]['list_quantity']
    current_packed_quantity = item.data[0]['packed_quantity'] if item.data[0]['packed_quantity'] else 0
    
    if not current_list_quantity:
        abort(400, message='Cannot mark item as packed if it is not in the list section')

    if json_data.is_entire_quantity:
        updated_item = {
            'list_quantity': None,
            'packed_quantity': current_packed_quantity + current_list_quantity
        }
    else:
        # check that the quantity is provided and is less than or equal to the list quantity
        if not json_data.quantity or current_list_quantity < json_data.quantity:
            abort(400, message='Cannot mark item as packed because quantity was either not provided or it was too large')
        
        updated_item = {
            'list_quantity': current_list_quantity - json_data.quantity,
            'packed_quantity': current_packed_quantity + json_data.quantity
        }

    # Update item
    item = g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, message='Failed to update item')
    
    return ItemResponse(item=item.data[0])

@bp.put('/<item_id>/mark-as-returning')
@auth.login_required
@bp.input(ReturningRequest, location='json')
@bp.output(ItemResponse, status_code=200)
def mark_as_returning(item_id: str, json_data: ReturningRequest):
    """Mark item as returning by updating its quantities (specifically "packed_quantity" or "purchased_quantity" and "returning_quantity")"""
    # Get user
    user = auth.current_user
    
    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')
    
    # Get current quantities
    origin = 'packed_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'
    current_origin_quantity = item.data[0][origin]
    current_returning_quantity = item.data[0]['returning_quantity'] if item.data[0]['returning_quantity'] else 0

    
    if not current_origin_quantity:
        abort(400, message='Cannot mark item as returning if it is not in the packed or purchased sections')

    if json_data.is_entire_quantity:
        updated_item = {
            origin: None,
            'returning_quantity': current_returning_quantity + current_origin_quantity
        }
    else:
        # check that the quantity is provided and is less than or equal to the origin quantity
        if not json_data.quantity or current_origin_quantity < json_data.quantity:
            abort(400, message='Cannot mark item as returning because quantity was either not provided or it was too large')
        
        updated_item = {
            origin: current_origin_quantity - json_data.quantity,
            'returning_quantity': current_returning_quantity + json_data.quantity
        }

    # Update item
    item = g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, message='Failed to update item')
    
    return ItemResponse(item=item.data[0])

@bp.put('/<item_id>/unmark-as-packed')
@auth.login_required
@bp.input(PackedRequest, location='json')
@bp.output(ItemResponse, status_code=200)
def unmark_as_packed(item_id: str, json_data: PackedRequest):
    """Unmark item as packed by updating its quantities (specifically "list_quantity" and "packed_quantity")"""
    # Get user
    user = auth.current_user
    
    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')
    
    # Get current quantities
    current_packed_quantity = item.data[0]['packed_quantity'] 
    current_list_quantity = item.data[0]['list_quantity'] if item.data[0]['list_quantity'] else 0
    
    if not current_packed_quantity:
        abort(400, message='Cannot unmark item as packed if it is not in the packed section')

    if json_data.is_entire_quantity:
        updated_item = {
            'list_quantity': current_list_quantity + current_packed_quantity,
            'packed_quantity': None
        }
    else:
        # check that the quantity is provided and is less than or equal to the packed quantity
        if not json_data.quantity or current_packed_quantity < json_data.quantity:
            abort(400, message='Cannot unmark item as packed because quantity was either not provided or it was too large')
        
        updated_item = {
            'list_quantity': current_list_quantity + json_data.quantity,
            'packed_quantity': current_packed_quantity - json_data.quantity
        }

    # Update item
    item = g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, message='Failed to update item')
    
    return ItemResponse(item=item.data[0])

@bp.put('/<item_id>/unmark-as-returning')
@auth.login_required
@bp.input(ReturningRequest, location='json')
@bp.output(ItemResponse, status_code=200)
def unmark_as_returning(item_id: str, json_data: ReturningRequest):
    """Unmark item as returning by updating its quantities (specifically "packed_quantity" or "purchased_quantity" and "returning_quantity")"""
    # Get user
    user = auth.current_user
    
    # Check if item exists
    item = g.supabase\
        .table('items')\
        .select('*', 'trips(user_id)') \
        .eq('id', item_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not item.data:
        abort(404, message='Item not found')
    
    # Get current quantities
    current_returning_quantity = item.data[0]['returning_quantity']
    origin = 'packed_quantity' if item.data[0]['origin'] == ItemOrigin.LISTED else 'purchased_quantity'
    current_origin_quantity = item.data[0][origin] if item.data[0][origin] else 0

    
    if not current_returning_quantity:
        abort(400, message='Cannot unmark item as returning if it is not in the returning section')

    if json_data.is_entire_quantity:
        updated_item = {
            origin: current_origin_quantity + current_returning_quantity,
            'returning_quantity': None
        }
    else:
        # check that the quantity is provided and is less than or equal to the returning quantity
        if not json_data.quantity or current_returning_quantity < json_data.quantity:
            abort(400, message='Cannot unmark item as returning because quantity was either not provided or it was too large')
        
        updated_item = {
            origin: current_origin_quantity + json_data.quantity,
            'returning_quantity': current_returning_quantity - json_data.quantity
        }

    # Update item
    item = g.supabase\
        .table('items')\
        .update(updated_item) \
        .eq('id', item_id) \
        .execute()
    
    if not item.data:
        abort(500, message='Failed to update item')
    
    return ItemResponse(item=item.data[0])