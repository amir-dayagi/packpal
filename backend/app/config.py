import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# Config class
class Config:
    # Supabase config
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

    # Quart config
    SECRET_KEY = os.getenv('BACKEND_SECRET_KEY')

    # Assistant config
    ASSISTANT_API_URL = os.getenv('BACKEND_ASSISTANT_API_URL')

    required = [SUPABASE_URL, SUPABASE_KEY, SECRET_KEY, ASSISTANT_API_URL]

    if not all(required):
        raise ValueError(f'Missing environment variables')