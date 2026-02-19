from apiflask import APIBlueprint, abort
from ..models.message_response import MessageResponse
from ..utils.auth import auth
from flask import g
from ..models.category import CategoryResponse, CreateCategoryReqeust, UpdateCategoryRequest

bp = APIBlueprint('categories', __name__, url_prefix='/categories')

# @bp.get('/<category_id>')
# @auth.login_required
# @bp.output(CategoryResponse, status_code=200)
# def get_category(category_id: str):
#     """Get a specific category for the current user"""
#     # Get user
#     user = auth.current_user

#     # Get category
#     category = g.supabase\
#         .table('categories')\
#         .select('*') \
#         .eq('id', category_id) \
#         .execute()

#     if not category.data:
#         abort(404, message="Trip not found")

#     # Return category
#     return CategoryResponse(category=category.data[0])

@bp.post('')
@auth.login_required
@bp.input(CreateCategoryReqeust, location='json')
@bp.output(CategoryResponse, status_code=201)
def create_category(json_data: CreateCategoryReqeust):
    """Create a new category for the current user on the specific trip"""
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
    
    new_category = {
        "trip_id": json_data.trip_id,
        "name": json_data.name
    }
    
    # Create category
    category = g.supabase\
        .table('categories')\
        .insert(new_category)\
        .execute()

    if not category.data:
        abort(500, message="Failed to create category")
    
    # Return category
    return CategoryResponse(category=category.data[0])

@bp.put('/<category_id>')
@auth.login_required
@bp.input(UpdateCategoryRequest, location='json')
@bp.output(CategoryResponse, status_code=200)
def update_category(category_id: str, json_data: UpdateCategoryRequest):
    """Update a specific category for the current user"""
    # Get user
    user = auth.current_user

    # Check if category exists and belongs to user
    category = g.supabase\
        .table('categories')\
        .select('*', 'trips(id, user_id)') \
        .eq('id', category_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not category.data:
        abort(404, message="Category not found")

    updated_category = {
        "name": json_data.name
    }
    
    # Update Category
    category = g.supabase\
        .table('categories')\
        .update(updated_category) \
        .eq('id', category_id) \
        .execute()
    
    if not category.data:
        abort(500, message="Failed to update category")
    
    # Return updated category
    return CategoryResponse(category=category.data[0])

@bp.delete('/<category_id>')
@auth.login_required
@bp.output(MessageResponse, status_code=200)
def delete_trip(category_id: str):
    """Delete a specific category for the current user"""
    # Get user
    user = auth.current_user

    # Check if category exists and belongs to user
    category = g.supabase\
        .table('categories')\
        .select('*', 'trips(id, user_id)') \
        .eq('id', category_id) \
        .eq('trips.user_id', user.id) \
        .execute()
    
    if not category.data:
        abort(404, message="Category not found")
    
    # Delete category
    category = g.supabase\
        .table('categories')\
        .delete() \
        .eq('id', category_id) \
        .execute() 

    if not category.data:
        abort(500, message="Failed to delete category")
    
    return MessageResponse(message="Category deleted successfully")