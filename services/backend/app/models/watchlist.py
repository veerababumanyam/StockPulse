"""
Watchlist database models for Story 2.4 Implementation
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Watchlist(Base):
    """
    User watchlist model
    
    Stores user's custom watchlists (users can have multiple watchlists)
    """
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False, default="My Watchlist")
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_watchlist_user_id", "user_id"),
        Index("idx_watchlist_user_default", "user_id", "is_default"),
        UniqueConstraint("user_id", "is_default", name="uq_user_default_watchlist"),
    )

    def __repr__(self):
        return f"<Watchlist(id={self.id}, user_id={self.user_id}, name='{self.name}', items={len(self.items) if self.items else 0})>"


class WatchlistItem(Base):
    """
    Individual stock symbol in a watchlist
    
    Links symbols to watchlists with additional metadata
    """
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False)
    symbol = Column(String(10), nullable=False)  # Stock symbol (e.g., AAPL)
    company_name = Column(String(200), nullable=True)  # Company name for caching
    
    # Additional metadata for enhanced functionality
    notes = Column(Text, nullable=True)  # User notes about this stock
    target_price = Column(String(20), nullable=True)  # User's target price (stored as string for flexibility)
    alert_enabled = Column(Boolean, default=False, nullable=False)  # Price alerts
    
    # Ordering within watchlist
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    watchlist = relationship("Watchlist", back_populates="items")
    
    # Indexes and constraints
    __table_args__ = (
        Index("idx_watchlist_item_watchlist_id", "watchlist_id"),
        Index("idx_watchlist_item_symbol", "symbol"),
        Index("idx_watchlist_item_order", "watchlist_id", "sort_order"),
        UniqueConstraint("watchlist_id", "symbol", name="uq_watchlist_symbol"),
    )

    def __repr__(self):
        return f"<WatchlistItem(id={self.id}, watchlist_id={self.watchlist_id}, symbol='{self.symbol}', company='{self.company_name}')>"


# Update User model to include watchlist relationship
def update_user_model():
    """
    This function should be called to update the User model
    Add this to your User model in app/models/user.py:
    
    # Add to User class:
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    """
    pass 