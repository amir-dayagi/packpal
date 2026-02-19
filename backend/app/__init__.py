from .config import Config
from apiflask import APIFlask, abort
from flask import g, request
from supabase import create_client, ClientOptions
from flask_cors import CORS
from psycopg_pool import ConnectionPool
import atexit

def create_app():
    """Create and configure the Flask application"""
    # Create the APIFlask application
    app = APIFlask(__name__)
    
    @app.before_request
    def initialize_supabase_client():
        """Initialize the Supabase client"""
        try:
            g.supabase = create_client(
                Config.SUPABASE_URL,
                Config.SUPABASE_KEY,
                options=ClientOptions(headers={
                    'Authorization': request.headers.get("Authorization")
                })
            )
        except Exception:
            abort(500, message="Failed to connect to database")
    
    # Configure CORS
    CORS(app)

    # Configure app
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['SUPABASE_URL'] = Config.SUPABASE_URL
    app.config['SUPABASE_KEY'] = Config.SUPABASE_KEY
    app.config['CHECKPOINTER_DB_URI'] = Config.CHECKPOINTER_DB_URI

    # Initialize connection pool (for assistant checkpointer)
    connection_pool = ConnectionPool(
        Config.CHECKPOINTER_DB_URI,
        max_size=10,
        min_size=1
    )
    app.connection_pool = connection_pool
    atexit.register(connection_pool.close)
    
    # Register blueprints
    from app.routes import trips, items, categories, assistant
    app.register_blueprint(trips.bp)
    app.register_blueprint(items.bp)
    app.register_blueprint(categories.bp)
    app.register_blueprint(assistant.bp)

    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return {'status': 'healthy', 'service': 'packpal-api'}, 200
    
    return app

# Create the application instance
app = create_app()