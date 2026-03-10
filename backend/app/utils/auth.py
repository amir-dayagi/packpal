from quart import g, abort
from quart.utils import run_sync
from functools import wraps
from quart import request
from quart_schema import OpenAPIProvider


def login_required(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            abort(401, "Missing or invalid Authorization header")
        
        token = auth_header.split(" ")[1]

        try:
            user_response = await g.supabase.auth.get_user(token)

            if not user_response or not user_response.user:
                abort(401, "Invalid or expired token")

            g.user = user_response.user
            
        except Exception as e:
            abort(401, "Authentication failed")

        return await f(*args, **kwargs)
    
    setattr(decorated, "_is_secure", True)
    
    return decorated


class CustomOpenAPIProvider(OpenAPIProvider):
    def build_paths(self, rule):
        paths, components = super().build_paths(rule)
        
        func = self._app.view_functions[rule.endpoint]
        
        if hasattr(func, "_is_secure"):
            path = list(paths.keys())[0]
            for method in paths[path]:
                paths[path][method].setdefault("security", []).append({"BearerAuth": []})
        
        return paths, components
