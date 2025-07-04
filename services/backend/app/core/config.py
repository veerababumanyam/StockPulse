"""
Configuration settings for the StockPulse backend application.
"""

from functools import lru_cache
from typing import List, Optional
import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12

    # Database settings
    database_url: str = "postgresql://user:pass@localhost/stockpulse"
    DATABASE_URL: str = "postgresql+asyncpg://stockpulse_user:stockpulse_password@localhost:5432/stockpulse"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Cookie Configuration
    COOKIE_HTTPONLY: bool = True
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_MAX_AGE: int = 1800

    # MCP Agent settings
    mcp_agent_notification_enabled: bool = True
    mcp_circuit_breaker_failure_threshold: int = 5
    mcp_circuit_breaker_recovery_timeout: int = 30
    mcp_notification_timeout: float = 5.0
    mcp_max_retry_attempts: int = 3

    # Redis settings
    redis_url: str = "redis://localhost:6379"
    redis_streams_enabled: bool = True
    redis_stream_max_length: int = 10000
    redis_consumer_group: str = "stockpulse_agents"

    # Agent endpoints
    technical_analysis_agent_endpoint: str = "http://localhost:8003"
    portfolio_optimization_agent_endpoint: str = "http://localhost:8004"
    risk_management_agent_endpoint: str = "http://localhost:8005"
    news_analysis_agent_endpoint: str = "http://localhost:8006"
    user_preference_agent_endpoint: str = "http://localhost:8007"
    
    # A2A Market Research Agent
    MARKET_RESEARCH_AGENT_URL: str = "http://localhost:9003"

    # Security settings
    agent_jwt_secret_key: str = "default_secret_key"
    agent_token_expire_minutes: int = 60

    # API Keys for market data providers
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FMP_API_KEY: Optional[str] = None
    POLYGON_API_KEY: Optional[str] = None
    TAAPI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # API Key encryption
    API_KEY_ENCRYPTION_KEY: Optional[str] = None

    model_config = {
        "env_file": [
            ".env",  # Default environment file
            "local.env"  # Local development overrides
        ], 
        "case_sensitive": False, 
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
