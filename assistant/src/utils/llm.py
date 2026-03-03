from langchain.chat_models import init_chat_model
import os
from .config import Config

def get_llm():
    model_provider = Config.MODEL_PROVIDER
    api_key = Config.MODEL_API_KEY
    if model_provider == "google_genai":
        os.environ["GOOGLE_API_KEY"] = api_key
    elif model_provider == "openai":
        os.environ["OPENAI_API_KEY"] = api_key
    elif model_provider == "anthropic":
        os.environ["ANTHROPIC_API_KEY"] = api_key
    else:
        raise ValueError(f"Unsupported model provider: {model_provider}")
    model_name = Config.MODEL_NAME
    return init_chat_model(model_provider=model_provider, model=model_name)