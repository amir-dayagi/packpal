import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Config class
class Config:
    # Supabase config
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')

    # Flask config
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

    # Google GenAI config
    GOOGLE_GENAI_API_KEY = os.getenv('GOOGLE_API_KEY')

    # LangGraph Checkpointer config
    CHECKPOINTER_DB_URI = os.getenv('CHECKPOINTER_DB_URI')

    if not SUPABASE_URL or not SUPABASE_KEY or not GOOGLE_GENAI_API_KEY or not CHECKPOINTER_DB_URI:
        raise ValueError('Missing environment variables')