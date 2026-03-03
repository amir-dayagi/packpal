from quart import g, abort
from quart.utils import run_sync
from functools import wraps
from quart import request

def login_required(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            abort(401, "Missing or invalid Authorization header")
        
        token = auth_header.split(" ")[1]

        try:
            user_response = await run_sync(g.supabase.auth.get_user)(token)

            if not user_response or not user_response.user:
                abort(401, "Invalid or expired token")

            g.user = user_response.user
            
        except Exception as e:
            abort(401, "Authentication failed")

        return await f(*args, **kwargs)
    
    return decorated