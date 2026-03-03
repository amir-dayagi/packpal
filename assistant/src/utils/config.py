import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

class Config:
    MODEL_PROVIDER = os.getenv('ASSISTANT_MODEL_PROVIDER')
    MODEL_NAME = os.getenv('ASSISTANT_MODEL_NAME')
    MODEL_API_KEY = os.getenv('ASSISTANT_MODEL_API_KEY')

    required = [MODEL_PROVIDER, MODEL_NAME, MODEL_API_KEY]

    if not all(required):
        raise ValueError('Missing environment variables')
    