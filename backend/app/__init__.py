from app.config import Config
from flask import Flask
from langchain.chat_models import init_chat_model

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['SUPABASE_URL'] = Config.SUPABASE_URL
    app.config['SUPABASE_KEY'] = Config.SUPABASE_KEY

    # Create LLM model
    app.llm = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
    
    # Register blueprints
    from app.routes import trips, items, suggested_items
    app.register_blueprint(trips.bp, url_prefix='/trips')
    app.register_blueprint(items.bp, url_prefix='/items')
    app.register_blueprint(suggested_items.bp, url_prefix='/suggested-items')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return {'status': 'healthy', 'service': 'packpal-api'}, 200
    
    return app

# Create the application instance
app = create_app()