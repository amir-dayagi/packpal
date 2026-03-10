from quart import Quart, abort, g, current_app, request
from quart_schema import QuartSchema
from quart_cors import cors
from supabase import acreate_client, AsyncClientOptions

from .config import Config
from .utils.auth import CustomOpenAPIProvider

def create_app():
    """Create and configure the Flask application"""
    # Create the APIFlask application
    app = Quart(__name__)
    app = cors(app)
    QuartSchema(
        app,
        security_schemes={
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer"
            }
        },
        openapi_provider_class=CustomOpenAPIProvider
    )
    
    # Configure app
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['SUPABASE_URL'] = Config.SUPABASE_URL
    app.config['SUPABASE_KEY'] = Config.SUPABASE_KEY

    @app.before_request
    async def initialize_supabase_client():
        """Initialize the Supabase client"""
        try:
            g.supabase = await acreate_client(
                current_app.config['SUPABASE_URL'],
                current_app.config['SUPABASE_KEY'],
                options=AsyncClientOptions(headers={
                    'Authorization': request.headers.get("Authorization")
                })
            )
        except Exception:
            abort(500, description="Failed to connect to database")
    
    # Register blueprints
    from app.routes import trips, items, categories, assistant
    app.register_blueprint(trips.bp)
    app.register_blueprint(items.bp)
    app.register_blueprint(categories.bp)
    app.register_blueprint(assistant.bp)

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        try:
            return {"status": "ok"}, 200
        except Exception:
            return {"status": "unhealthy"}, 500
    
    return app

app = create_app()