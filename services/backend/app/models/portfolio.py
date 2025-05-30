"""
Portfolio Database Models
SQLAlchemy models for portfolio management with proper financial data handling.
Following enterprise database design patterns and compliance requirements.
"""
import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    Column, String, DateTime, Numeric, Integer, Boolean, 
    ForeignKey, Index, CheckConstraint, Enum as SQLEnum, Date, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func

from app.schemas.portfolio import PositionType, TransactionType, PortfolioStatus
from .base import Base


class Portfolio(Base):
    """
    Portfolio model for tracking user investment portfolios.
    Implements audit trails and compliance requirements.
    """
    __tablename__ = "portfolios"
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(SQLEnum(PortfolioStatus), nullable=False, default=PortfolioStatus.ACTIVE, index=True)
    
    # Financial metrics - using NUMERIC for precision
    total_value = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    total_cost = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    cash_balance = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    
    # Calculated fields (updated by background jobs)
    total_pnl = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    total_pnl_percent = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    day_change = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    day_change_percent = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    
    # Audit and metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_calculated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    positions = relationship("PortfolioPosition", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")
    insights = relationship("AIPortfolioInsight", back_populates="portfolio", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('total_value >= 0', name='check_total_value_non_negative'),
        CheckConstraint('total_cost >= 0', name='check_total_cost_non_negative'),
        CheckConstraint('cash_balance >= 0', name='check_cash_balance_non_negative'),
        Index('idx_portfolio_user_status', 'user_id', 'status'),
        Index('idx_portfolio_created_at', 'created_at'),
    )
    
    @validates('currency')
    def validate_currency(self, key, currency):
        """Validate currency code format."""
        if len(currency) != 3:
            raise ValueError("Currency must be 3 characters long")
        return currency.upper()
    
    def __repr__(self):
        return f"<Portfolio(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class PortfolioPosition(Base):
    """
    Portfolio position model for tracking individual holdings.
    Implements real-time position tracking with audit compliance.
    """
    __tablename__ = "portfolio_positions"
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    position_type = Column(SQLEnum(PositionType), nullable=False, default=PositionType.EQUITY, index=True)
    
    # Position data - using NUMERIC for financial precision
    quantity = Column(Numeric(precision=15, scale=6), nullable=False, default=0)
    average_cost = Column(Numeric(precision=12, scale=4), nullable=False, default=0)
    current_price = Column(Numeric(precision=12, scale=4), nullable=True)
    
    # Calculated fields (updated by market data feeds)
    market_value = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    cost_basis = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    unrealized_pnl = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    unrealized_pnl_percent = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    weight = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    
    # Market data timestamps
    last_updated = Column(DateTime(timezone=True), nullable=True)
    price_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="positions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
        CheckConstraint('average_cost >= 0', name='check_average_cost_non_negative'),
        CheckConstraint('current_price >= 0', name='check_current_price_non_negative'),
        CheckConstraint('market_value >= 0', name='check_market_value_non_negative'),
        CheckConstraint('cost_basis >= 0', name='check_cost_basis_non_negative'),
        Index('idx_position_portfolio_symbol', 'portfolio_id', 'symbol', unique=True),
        Index('idx_position_symbol_type', 'symbol', 'position_type'),
        Index('idx_position_updated_at', 'updated_at'),
    )
    
    @validates('symbol')
    def validate_symbol(self, key, symbol):
        """Validate symbol format."""
        if not symbol or len(symbol.strip()) == 0:
            raise ValueError("Symbol cannot be empty")
        return symbol.upper().strip()
    
    def __repr__(self):
        return f"<PortfolioPosition(id={self.id}, symbol='{self.symbol}', quantity={self.quantity})>"


class Transaction(Base):
    """
    Transaction model for audit compliance and regulatory reporting.
    Tracks all portfolio transactions with full audit trail.
    """
    __tablename__ = "transactions"
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Transaction details
    symbol = Column(String(20), nullable=False, index=True)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False, index=True)
    quantity = Column(Numeric(precision=15, scale=6), nullable=False)
    price = Column(Numeric(precision=12, scale=4), nullable=False)
    fees = Column(Numeric(precision=10, scale=2), nullable=False, default=0)
    total_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    
    # Transaction metadata
    transaction_date = Column(Date, nullable=False, index=True)
    settlement_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    external_id = Column(String(100), nullable=True, index=True)  # For broker integration
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Additional metadata for compliance
    regulatory_data = Column(JSONB, nullable=True)  # Store additional regulatory info
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="transactions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_non_negative'),
        CheckConstraint('fees >= 0', name='check_fees_non_negative'),
        CheckConstraint('total_amount != 0', name='check_total_amount_not_zero'),
        Index('idx_transaction_portfolio_date', 'portfolio_id', 'transaction_date'),
        Index('idx_transaction_symbol_type', 'symbol', 'transaction_type'),
        Index('idx_transaction_user_date', 'user_id', 'transaction_date'),
        Index('idx_transaction_external_id', 'external_id'),
    )
    
    @validates('symbol')
    def validate_symbol(self, key, symbol):
        """Validate symbol format."""
        if not symbol or len(symbol.strip()) == 0:
            raise ValueError("Symbol cannot be empty")
        return symbol.upper().strip()
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, symbol='{self.symbol}', type='{self.transaction_type}')>"


class AIPortfolioInsight(Base):
    """
    AI-generated portfolio insights model.
    Stores AI analysis results with confidence scores and expiration.
    """
    __tablename__ = "ai_portfolio_insights"
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False, index=True)
    
    # Insight content
    insight_type = Column(String(50), nullable=False, index=True)  # summary, recommendation, alert
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    confidence_score = Column(Numeric(precision=3, scale=2), nullable=False)  # 0.00 to 1.00
    
    # Metadata
    tags = Column(JSONB, nullable=True)  # Store tags as JSON array
    action_required = Column(Boolean, nullable=False, default=False, index=True)
    
    # AI model information
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    generation_metadata = Column(JSONB, nullable=True)  # Store model parameters, context, etc.
    
    # Lifecycle
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    viewed_at = Column(DateTime(timezone=True), nullable=True)
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="insights")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', 
                       name='check_confidence_score_range'),
        Index('idx_insight_portfolio_type', 'portfolio_id', 'insight_type'),
        Index('idx_insight_action_required', 'action_required', 'created_at'),
        Index('idx_insight_expires_at', 'expires_at'),
    )
    
    def __repr__(self):
        return f"<AIPortfolioInsight(id={self.id}, type='{self.insight_type}', title='{self.title[:50]}')>"


class PortfolioSnapshot(Base):
    """
    Portfolio snapshot model for historical tracking and performance analysis.
    Captures portfolio state at specific points in time.
    """
    __tablename__ = "portfolio_snapshots"
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False, index=True)
    
    # Snapshot data
    snapshot_date = Column(Date, nullable=False, index=True)
    total_value = Column(Numeric(precision=15, scale=2), nullable=False)
    total_cost = Column(Numeric(precision=15, scale=2), nullable=False)
    cash_balance = Column(Numeric(precision=15, scale=2), nullable=False)
    positions_data = Column(JSONB, nullable=False)  # Store positions snapshot
    
    # Performance metrics
    day_return = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    day_return_percent = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    total_return = Column(Numeric(precision=15, scale=2), nullable=False, default=0)
    total_return_percent = Column(Numeric(precision=8, scale=4), nullable=False, default=0)
    
    # Risk metrics
    volatility = Column(Numeric(precision=8, scale=4), nullable=True)
    beta = Column(Numeric(precision=6, scale=4), nullable=True)
    sharpe_ratio = Column(Numeric(precision=6, scale=4), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('total_value >= 0', name='check_snapshot_total_value_non_negative'),
        CheckConstraint('total_cost >= 0', name='check_snapshot_total_cost_non_negative'),
        CheckConstraint('cash_balance >= 0', name='check_snapshot_cash_balance_non_negative'),
        Index('idx_snapshot_portfolio_date', 'portfolio_id', 'snapshot_date', unique=True),
        Index('idx_snapshot_date', 'snapshot_date'),
    )
    
    def __repr__(self):
        return f"<PortfolioSnapshot(id={self.id}, portfolio_id={self.portfolio_id}, date={self.snapshot_date})>" 