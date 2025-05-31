"""
Market Data Models
Comprehensive models for historical market data storage and analytics
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from .base import Base

class MarketDataSnapshot(Base):
    """
    Historical market data snapshots for caching and analysis
    Stores point-in-time market data with TTL for cache management
    """
    __tablename__ = "market_data_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    symbol = Column(String(20), nullable=False, index=True)
    data_type = Column(String(50), nullable=False)  # 'quote', 'chart', 'news', 'fundamentals'
    data_payload = Column(JSONB, nullable=False)
    
    # Cache management
    cache_key = Column(String(200), nullable=False, unique=True, index=True)
    ttl_seconds = Column(Integer, nullable=False, default=60)
    expires_at = Column(DateTime, nullable=False, index=True)
    
    # Market data fields for quick access
    price = Column(Float, nullable=True)
    volume = Column(Integer, nullable=True)
    market_cap = Column(Float, nullable=True)
    change = Column(Float, nullable=True)
    change_percent = Column(Float, nullable=True)
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    source = Column(String(50), nullable=True)
    
    __table_args__ = (
        Index('idx_market_data_symbol_type', 'symbol', 'data_type'),
        Index('idx_market_data_expires', 'expires_at'),
    )

class TransactionHistory(Base):
    """
    Comprehensive transaction history for audit trails and analysis
    """
    __tablename__ = "transaction_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    portfolio_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Transaction details
    symbol = Column(String(20), nullable=False, index=True)
    transaction_type = Column(String(20), nullable=False)  # 'buy', 'sell', 'dividend', 'split'
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    fees = Column(Float, nullable=False, default=0.0)
    
    # Timestamps
    transaction_timestamp = Column(DateTime, nullable=False, index=True)
    recorded_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Additional data
    transaction_metadata = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    
    __table_args__ = (
        Index('idx_transaction_user_time', 'user_id', 'transaction_timestamp'),
        Index('idx_transaction_symbol_time', 'symbol', 'transaction_timestamp'),
    )

class UserPreferences(Base):
    """
    User preferences and configuration settings
    """
    __tablename__ = "user_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Dashboard preferences
    dashboard_layout = Column(JSONB, nullable=True)
    default_timeframe = Column(String(10), nullable=False, default="1M")
    default_chart_type = Column(String(20), nullable=False, default="line")
    theme = Column(String(20), nullable=False, default="light")
    
    # AI preferences
    ai_insights_enabled = Column(Boolean, nullable=False, default=True)
    ai_recommendations_enabled = Column(Boolean, nullable=False, default=True)
    
    # Cache preferences
    cache_duration_minutes = Column(Integer, nullable=False, default=5)
    
    # Notification preferences
    notification_settings = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class CacheMetrics(Base):
    """
    Cache performance metrics and monitoring
    """
    __tablename__ = "cache_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Cache identification
    cache_type = Column(String(50), nullable=False, index=True)  # 'market_data', 'portfolio', 'news'
    cache_key = Column(String(200), nullable=False, index=True)
    
    # Performance metrics
    hit_count = Column(Integer, nullable=False, default=0)
    miss_count = Column(Integer, nullable=False, default=0)
    total_requests = Column(Integer, nullable=False, default=0)
    hit_ratio = Column(Float, nullable=False, default=0.0)
    
    # Timing metrics
    avg_response_time_ms = Column(Float, nullable=False, default=0.0)
    max_response_time_ms = Column(Float, nullable=False, default=0.0)
    min_response_time_ms = Column(Float, nullable=False, default=0.0)
    
    # Size metrics
    cache_size_bytes = Column(Integer, nullable=False, default=0)
    entry_count = Column(Integer, nullable=False, default=0)
    
    # Timestamps
    measurement_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    measurement_period_start = Column(DateTime, nullable=False)
    measurement_period_end = Column(DateTime, nullable=False)
    
    __table_args__ = (
        Index('idx_cache_metrics_type_time', 'cache_type', 'measurement_timestamp'),
    ) 