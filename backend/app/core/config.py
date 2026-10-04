import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, field_validator

class Settings(BaseSettings):
    # App Settings
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = 8000
    
    @field_validator("API_PORT", mode="before")
    def parse_api_port(cls, v):
        if not v:
            return 8000
        return int(v)

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@localhost:5432/fit_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    @field_validator("DATABASE_URL", "REDIS_URL", mode="before")
    def parse_urls(cls, v, info):
        if not v:
            if info.field_name == "DATABASE_URL":
                return "postgresql+psycopg2://postgres:password@localhost:5432/fit_db"
            if info.field_name == "REDIS_URL":
                return "redis://localhost:6379/0"
        return str(v)

    # Embeddings
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", 384))

    # Groq
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_MODELS: str | None = None

    # FRED
    FRED_API_KEY: str | None = None

    model_config = ConfigDict(
        case_sensitive=True, 
        env_file=str(Path(__file__).resolve().parent.parent.parent.parent / ".env"), 
        extra="ignore"
    )

settings = Settings()
