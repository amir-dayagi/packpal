from apiflask import HTTPTokenAuth
from flask import current_app, g
from supabase import create_client, ClientOptions

auth = HTTPTokenAuth()

@auth.verify_token
def verify_token(token: str) -> bool:
    """Verify the token"""
    try:
        # Get user data from token
        user_data = g.supabase.auth.get_user(token)

        # Check if user data is valid
        if not user_data:
            False
        
        # Return user data
        return user_data.user
    
    # Return False if token is invalid
    except Exception:
        return False