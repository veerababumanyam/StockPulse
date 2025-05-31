# Models package initialization
# This ensures all models are imported for SQLAlchemy metadata

from .user import User
from .portfolio import Portfolio, PortfolioPosition, Transaction, AIPortfolioInsight, PortfolioSnapshot
from .api_keys import APIProvider, APIKey, APIKeyUsage
from .market_data import MarketDataSnapshot, TransactionHistory, UserPreferences, CacheMetrics

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
    "CacheMetrics"
] 