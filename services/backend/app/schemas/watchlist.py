"""
Pydantic schemas for watchlist API endpoints - Story 2.4 Implementation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# Request schemas

class AddWatchlistItemRequest(BaseModel):
    """Schema for adding a symbol to watchlist"""
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock symbol (e.g., AAPL)")
    name: Optional[str] = Field(None, max_length=200, description="Company name (optional)")
    notes: Optional[str] = Field(None, max_length=1000, description="User notes about this stock")
    target_price: Optional[str] = Field(None, max_length=20, description="Target price")
    alert_enabled: bool = Field(False, description="Enable price alerts")

    @validator('symbol')
    def validate_symbol(cls, v):
        if not v:
            raise ValueError('Symbol cannot be empty')
        # Convert to uppercase and strip whitespace
        symbol = v.upper().strip()
        # Basic validation for stock symbol format
        if not symbol.isalpha():
            raise ValueError('Symbol must contain only letters')
        if len(symbol) > 10:
            raise ValueError('Symbol must be 10 characters or less')
        return symbol

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WatchlistItemCreate(BaseModel):
    """Schema for creating watchlist items (internal use)"""
    watchlist_id: int
    symbol: str
    company_name: Optional[str] = None
    notes: Optional[str] = None
    target_price: Optional[str] = None
    alert_enabled: bool = False
    sort_order: int = 0


class WatchlistItemUpdate(BaseModel):
    """Schema for updating watchlist items"""
    notes: Optional[str] = Field(None, max_length=1000)
    target_price: Optional[str] = Field(None, max_length=20)
    alert_enabled: Optional[bool] = None
    sort_order: Optional[int] = None


class CreateWatchlistRequest(BaseModel):
    """Schema for creating a new watchlist"""
    name: str = Field(..., min_length=1, max_length=100, description="Watchlist name")
    description: Optional[str] = Field(None, max_length=500, description="Watchlist description")
    is_public: bool = Field(False, description="Make watchlist public")


# Response schemas

class WatchlistItemResponse(BaseModel):
    """Schema for watchlist item in API responses"""
    id: str
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float = Field(alias="changePercent")
    volume: int
    market_cap: Optional[int] = Field(None, alias="marketCap")
    logo_url: Optional[str] = Field(None, alias="logoUrl")
    notes: Optional[str] = None
    target_price: Optional[str] = Field(None, alias="targetPrice")
    alert_enabled: bool = Field(alias="alertEnabled")
    sort_order: int = Field(alias="sortOrder")
    added_at: Optional[str] = Field(None, alias="addedAt")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WatchlistResponse(BaseModel):
    """Schema for complete watchlist in API responses"""
    watchlist_id: str = Field(alias="watchlistId")
    name: str
    description: Optional[str] = None
    items: List[WatchlistItemResponse]
    total_items: int = Field(alias="totalItems")
    is_default: bool = Field(alias="isDefault")
    is_public: bool = Field(alias="isPublic")
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")
    last_updated: Optional[str] = Field(None, alias="lastUpdated")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WatchlistSymbolsResponse(BaseModel):
    """Schema for lightweight watchlist symbols response"""
    symbols: List[str]
    count: int
    watchlist_id: Optional[str] = Field(None, alias="watchlistId")

    class Config:
        allow_population_by_field_name = True


class WatchlistListResponse(BaseModel):
    """Schema for listing user's watchlists"""
    watchlists: List[WatchlistResponse]
    total_count: int = Field(alias="totalCount")
    default_watchlist_id: Optional[str] = Field(None, alias="defaultWatchlistId")

    class Config:
        allow_population_by_field_name = True


# Market data schemas for real-time updates

class MarketDataQuote(BaseModel):
    """Schema for market data quotes"""
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float = Field(alias="changePercent")
    volume: int
    market_cap: Optional[int] = Field(None, alias="marketCap")
    day_high: Optional[float] = Field(None, alias="dayHigh")
    day_low: Optional[float] = Field(None, alias="dayLow")
    previous_close: Optional[float] = Field(None, alias="previousClose")
    logo_url: Optional[str] = Field(None, alias="logoUrl")
    exchange: Optional[str] = None
    currency: str = "USD"
    timestamp: Optional[str] = None

    class Config:
        allow_population_by_field_name = True


class MarketDataBatchResponse(BaseModel):
    """Schema for batch market data responses"""
    quotes: List[MarketDataQuote]
    symbols_found: List[str] = Field(alias="symbolsFound")
    symbols_not_found: List[str] = Field(alias="symbolsNotFound")
    timestamp: str

    class Config:
        allow_population_by_field_name = True


# WebSocket message schemas

class WebSocketMessage(BaseModel):
    """Base schema for WebSocket messages"""
    type: str
    timestamp: Optional[str] = None


class MarketDataUpdateMessage(WebSocketMessage):
    """Schema for real-time market data updates via WebSocket"""
    type: str = "market_data"
    symbol: str
    price: float
    change: float
    change_percent: float = Field(alias="changePercent")
    volume: int
    timestamp: str

    class Config:
        allow_population_by_field_name = True


class WatchlistUpdateMessage(WebSocketMessage):
    """Schema for watchlist change notifications via WebSocket"""
    type: str = "watchlist_update"
    action: str  # "added", "removed", "updated"
    watchlist_id: str = Field(alias="watchlistId")
    symbol: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

    class Config:
        allow_population_by_field_name = True


class SubscriptionMessage(WebSocketMessage):
    """Schema for WebSocket subscription requests"""
    type: str = "subscription"
    action: str  # "subscribe", "unsubscribe"
    symbols: List[str]


# API response wrappers

class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
    timestamp: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WatchlistAPIResponse(APIResponse):
    """Typed API response for watchlist operations"""
    data: Optional[WatchlistResponse] = None


class WatchlistItemAPIResponse(APIResponse):
    """Typed API response for watchlist item operations"""
    data: Optional[WatchlistItemResponse] = None


class WatchlistSymbolsAPIResponse(APIResponse):
    """Typed API response for watchlist symbols operations"""
    data: Optional[WatchlistSymbolsResponse] = None 