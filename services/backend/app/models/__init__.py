# Models package initialization
# This ensures all models are imported for SQLAlchemy metadata

from .api_keys import APIKey, APIKeyUsage, APIProvider
from .market_data import (
    CacheMetrics,
    MarketDataSnapshot,
    TransactionHistory,
    UserPreferences,
)
from .portfolio import (
    AIPortfolioInsight,
    Portfolio,
    PortfolioPosition,
    PortfolioSnapshot,
    Transaction,
)
from .user import User

# Import all base models for metadata creation
__all__ = [
    "User",
    "Portfolio",
    "PortfolioPosition",
    "Transaction",
    "AIPortfolioInsight",
    "APIProvider",
    "APIKey",
    "APIKeyUsage",
    "MarketDataSnapshot",
    "PortfolioSnapshot",
    "TransactionHistory",
    "UserPreferences",
    "CacheMetrics",
]
