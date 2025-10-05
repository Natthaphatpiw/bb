import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Basic App Settings
    APP_NAME: str = "MarketPulse API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS Settings
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./marketpulse.db"  # Default to SQLite for development
    DATABASE_ECHO: bool = False
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    
    # API Keys
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None

    # Azure OpenAI Settings
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_VERSION: str = "2024-02-15-preview"
    AZURE_OPENAI_DEPLOYMENT_NAME: Optional[str] = None
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # External APIs
    EXTERNAL_API_TIMEOUT: int = 10  # seconds
    MAX_RETRIES: int = 3
    
    # Background Tasks
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Data Update Intervals (seconds)
    MARKET_DATA_UPDATE_INTERVAL: int = 60
    AI_INSIGHTS_UPDATE_INTERVAL: int = 900  # 15 minutes
    NEWS_UPDATE_INTERVAL: int = 600  # 10 minutes
    
    # Mock Data Settings
    USE_MOCK_DATA: bool = True  # Set to False when real APIs are configured
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()