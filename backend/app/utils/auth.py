from functools import wraps
from flask import request, jsonify, current_app, g
from typing import Callable, Any
from supabase import create_client, ClientOptions

def require_auth(f: Callable) -> Callable:
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No authorization header or invalid format'}), 401

        
        # Create Supabase client
        client = create_client(
            current_app.config["SUPABASE_URL"],
            current_app.config["SUPABASE_KEY"],
            options=ClientOptions(headers={
            'Authorization': auth_header
            })
        )

        try:
            # Get user data from token
            user_data = client.auth.get_user(auth_header.split(' ')[1])

            # Check if user data is valid
            if not user_data:
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        
        # Store Supabase client in Flask's g object for route handlers
        g.supabase = client

        # Pass user_id to the route function
        return f(user_id=user_data.user.id, *args, **kwargs)
    
    return decorated

