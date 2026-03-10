from quart import Blueprint, g, abort
from quart_schema import validate_request, validate_response

from ..models.category import CategoryResponse, CreateCategoryReqeust, UpdateCategoryRequest
from ..models.message_response import MessageResponse
from ..utils.auth import login_required

bp = Blueprint('categories', __name__, url_prefix='/categories')

@bp.route('', methods=['POST'])
@login_required
@validate_request(CreateCategoryReqeust)
@validate_response(CategoryResponse, status_code=201)
async def create_category(data: CreateCategoryReqeust):
    """Create a new category for the current user on the specific trip"""
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
    
    new_category = {
        "trip_id": data.trip_id,
        "name": data.name
    }
    
    # Create category
    category = await g.supabase\
        .table('categories')\
        .insert(new_category)\
        .execute()

    if not category.data:
        abort(500, description="Failed to create category")
    
    # Return category
    return CategoryResponse(category=category.data[0])

@bp.route('/<category_id>', methods=['PUT'])
@login_required
@validate_request(UpdateCategoryRequest)
@validate_response(CategoryResponse, status_code=200)
async def update_category(category_id: str, data: UpdateCategoryRequest):
    """Update a specific category for the current user"""
    user = g.user

    # Check if category exists and belongs to user
    category = await g.supabase\
        .table('categories')\
        .select('*', 'trips(id, user_id)') \
        .eq('id', category_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not category.data:
        abort(404, "Category not found")

    updated_category = {
        "name": data.name
    }
    
    # Update Category
    category = await g.supabase\
        .table('categories')\
        .update(updated_category) \
        .eq('id', category_id) \
        .execute()
    
    if not category.data:
        abort(500, description="Failed to update category")
    
    # Return updated category
    return CategoryResponse(category=category.data[0])

@bp.route('/<category_id>', methods=['DELETE'])
@login_required
@validate_response(MessageResponse, status_code=200)
async def delete_category(category_id: str):
    """Delete a specific category for the current user"""
    user = g.user

    # Check if category exists and belongs to user
    category = await g.supabase\
        .table('categories')\
        .select('*', 'trips(id, user_id)') \
        .eq('id', category_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not category.data:
        abort(404, "Category not found")
    
    # Delete category
    category = await g.supabase\
        .table('categories')\
        .delete() \
        .eq('id', category_id) \
        .execute() 

    if not category.data:
        abort(500, description="Failed to delete category")
    
    return MessageResponse(message="Category deleted successfully")