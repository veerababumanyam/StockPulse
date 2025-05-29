"""
Application configuration settings.
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"  # Changed to HS256 for simplicity
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # PostgreSQL Database (Main relational database)
    DATABASE_URL: str = "postgresql+asyncpg://stockpulse_user:stockpulse_password@localhost:5432/stockpulse"
    
    # TimescaleDB (Time-series data)
    TIMESCALE_URL: str = "postgresql+asyncpg://timescale_user:timescale_password@localhost:5433/stockpulse_timeseries"
    
    # Redis (Caching & Session Storage)
    REDIS_URL: str = "redis://:stockpulse_redis_password@localhost:6379"
    
    # Neo4j (Knowledge Graph with Graphiti)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "stockpulse_neo4j_password"
    NEO4J_DATABASE: str = "neo4j"
    
    # Graphiti Knowledge Graph Configuration
    GRAPHITI_LLM_MODEL: str = "gpt-4o-mini"
    GRAPHITI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    GRAPHITI_USE_PARALLEL_RUNTIME: bool = False  # Set to True for enterprise Neo4j
    
    # Qdrant (Vector Database for RAG - Legacy, now using Graphiti+Neo4j)
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Rate Limiting
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_GLOBAL: str = "100/minute"
    
    # Session Security
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 30
    
    # AI/ML Configuration
    OPENAI_API_KEY: Optional[str] = None
    
    # Graphiti Knowledge Sources Configuration
    GRAPHITI_GROUPS: List[str] = [
        "financial_news",
        "company_filings", 
        "market_analysis",
        "user_interactions",
        "research_reports"
    ]
    
    # External APIs (as per infrastructure design)
    FMP_API_KEY: Optional[str] = None  # Financial Modeling Prep
    TAAPI_API_KEY: Optional[str] = None  # TAAPI.IO for technical indicators
    
    # Cookie Configuration
    COOKIE_HTTPONLY: bool = True
    COOKIE_SECURE: bool = False  # Set to False for development
    COOKIE_SAMESITE: str = "lax"  # Changed to lax for development
    COOKIE_MAX_AGE: int = 1800  # 30 minutes
    
    # Password Security
    BCRYPT_ROUNDS: int = 12
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @field_validator("GRAPHITI_GROUPS", mode="before") 
    @classmethod
    def assemble_graphiti_groups(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 