import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:password@localhost:5432/fit_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Embeddings
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", 384))

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
