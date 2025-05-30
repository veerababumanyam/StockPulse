"""
Portfolio Schemas
Pydantic models for portfolio data validation and serialization.
Following enterprise standards with proper financial data handling.
"""
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from enum import Enum

from pydantic import BaseModel, Field, validator, root_validator
from pydantic.types import UUID4


class PositionType(str, Enum):
    """Position types following industry standards."""
    EQUITY = "equity"
    BOND = "bond"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    OPTION = "option"
    FUTURE = "future"
    CRYPTO = "crypto"
    CASH = "cash"


class TransactionType(str, Enum):
    """Transaction types for audit compliance."""
    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    SPLIT = "split"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    FEE = "fee"
    INTEREST = "interest"


class PortfolioStatus(str, Enum):
    """Portfolio status following risk management standards."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    RESTRICTED = "restricted"
    LIQUIDATING = "liquidating"
    CLOSED = "closed"


# Base schemas
class PortfolioPositionBase(BaseModel):
    """Base portfolio position schema."""
    symbol: str = Field(..., min_length=1, max_length=20, description="Stock symbol")
    position_type: PositionType = Field(..., description="Type of position")
    quantity: Decimal = Field(..., ge=0, description="Quantity held")
    average_cost: Decimal = Field(..., ge=0, description="Average cost per share")
    current_price: Optional[Decimal] = Field(None, ge=0, description="Current market price")
    last_updated: Optional[datetime] = Field(None, description="Last price update timestamp")
    
    @validator('quantity', 'average_cost', 'current_price', pre=True)
    def validate_decimal_precision(cls, v):
        """Ensure proper decimal precision for financial calculations."""
        if v is not None:
            return Decimal(str(v)).quantize(Decimal('0.01'))
        return v

    class Config:
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


class PortfolioPositionCreate(PortfolioPositionBase):
    """Schema for creating new portfolio positions."""
    pass


class PortfolioPositionUpdate(BaseModel):
    """Schema for updating portfolio positions."""
    quantity: Optional[Decimal] = Field(None, ge=0)
    average_cost: Optional[Decimal] = Field(None, ge=0)
    current_price: Optional[Decimal] = Field(None, ge=0)
    
    @validator('quantity', 'average_cost', 'current_price', pre=True)
    def validate_decimal_precision(cls, v):
        if v is not None:
            return Decimal(str(v)).quantize(Decimal('0.01'))
        return v


class PortfolioPosition(PortfolioPositionBase):
    """Complete portfolio position with calculated fields."""
    id: UUID4
    portfolio_id: UUID4
    market_value: Decimal = Field(..., description="Current market value")
    unrealized_pnl: Decimal = Field(..., description="Unrealized profit/loss")
    unrealized_pnl_percent: Decimal = Field(..., description="Unrealized P&L percentage")
    cost_basis: Decimal = Field(..., description="Total cost basis")
    weight: Decimal = Field(..., description="Portfolio weight percentage")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


# Portfolio schemas
class PortfolioBase(BaseModel):
    """Base portfolio schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Portfolio name")
    description: Optional[str] = Field(None, max_length=500, description="Portfolio description")
    currency: str = Field(default="USD", min_length=3, max_length=3, description="Base currency")
    status: PortfolioStatus = Field(default=PortfolioStatus.ACTIVE, description="Portfolio status")


class PortfolioCreate(PortfolioBase):
    """Schema for creating new portfolios."""
    pass


class PortfolioUpdate(BaseModel):
    """Schema for updating portfolios."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[PortfolioStatus] = None


class Portfolio(PortfolioBase):
    """Complete portfolio schema with calculated metrics."""
    id: UUID4
    user_id: UUID4
    total_value: Decimal = Field(..., description="Total portfolio value")
    total_cost: Decimal = Field(..., description="Total cost basis")
    total_pnl: Decimal = Field(..., description="Total profit/loss")
    total_pnl_percent: Decimal = Field(..., description="Total P&L percentage")
    cash_balance: Decimal = Field(default=Decimal('0'), description="Cash balance")
    day_change: Decimal = Field(..., description="Today's change in value")
    day_change_percent: Decimal = Field(..., description="Today's change percentage")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


# Portfolio summary and analytics schemas
class PortfolioSummary(BaseModel):
    """Portfolio summary for dashboard display."""
    portfolio_id: UUID4
    portfolio_name: str
    total_value: Decimal
    day_change: Decimal
    day_change_percent: Decimal
    total_pnl: Decimal
    total_pnl_percent: Decimal
    cash_balance: Decimal
    positions_count: int
    last_updated: datetime
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


class PortfolioAnalytics(BaseModel):
    """Advanced portfolio analytics."""
    portfolio_id: UUID4
    total_value: Decimal
    asset_allocation: Dict[str, Decimal] = Field(..., description="Asset allocation by type")
    sector_allocation: Dict[str, Decimal] = Field(..., description="Sector allocation")
    top_holdings: List[Dict[str, Any]] = Field(..., description="Top 10 holdings")
    performance_metrics: Dict[str, Decimal] = Field(..., description="Performance metrics")
    risk_metrics: Dict[str, Decimal] = Field(..., description="Risk metrics")
    generated_at: datetime
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


class AIPortfolioInsight(BaseModel):
    """AI-generated portfolio insights."""
    portfolio_id: UUID4
    insight_type: str = Field(..., description="Type of insight (summary, recommendation, alert)")
    title: str = Field(..., max_length=200, description="Insight title")
    content: str = Field(..., description="Detailed insight content")
    confidence_score: float = Field(..., ge=0, le=1, description="AI confidence score")
    tags: List[str] = Field(default=[], description="Insight tags")
    action_required: bool = Field(default=False, description="Whether action is required")
    created_at: datetime
    expires_at: Optional[datetime] = Field(None, description="Insight expiration time")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# Transaction schemas for audit compliance
class TransactionBase(BaseModel):
    """Base transaction schema for audit trails."""
    symbol: str = Field(..., min_length=1, max_length=20)
    transaction_type: TransactionType
    quantity: Decimal = Field(..., description="Transaction quantity")
    price: Decimal = Field(..., ge=0, description="Transaction price")
    fees: Decimal = Field(default=Decimal('0'), ge=0, description="Transaction fees")
    transaction_date: date = Field(..., description="Transaction date")
    notes: Optional[str] = Field(None, max_length=500, description="Transaction notes")
    
    @validator('quantity', 'price', 'fees', pre=True)
    def validate_decimal_precision(cls, v):
        if v is not None:
            return Decimal(str(v)).quantize(Decimal('0.01'))
        return v


class TransactionCreate(TransactionBase):
    """Schema for creating new transactions."""
    pass


class Transaction(TransactionBase):
    """Complete transaction with audit fields."""
    id: UUID4
    portfolio_id: UUID4
    user_id: UUID4
    total_amount: Decimal = Field(..., description="Total transaction amount")
    created_at: datetime
    created_by: UUID4
    
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


# Response schemas for API endpoints
class PortfolioResponse(BaseModel):
    """Standard portfolio response."""
    success: bool = True
    message: str
    data: Optional[Portfolio] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PortfolioDetailResponse(BaseModel):
    """Detailed portfolio response with positions and insights."""
    success: bool = True
    message: str
    data: Optional[Portfolio] = None
    positions: List[PortfolioPosition] = Field(default=[], description="Portfolio positions")
    insights: List[AIPortfolioInsight] = Field(default=[], description="AI insights")
    analytics: Optional[PortfolioAnalytics] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PortfolioPositionResponse(BaseModel):
    """Portfolio position response."""
    success: bool = True
    message: str
    data: Optional[PortfolioPosition] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TransactionResponse(BaseModel):
    """Transaction response."""
    success: bool = True
    message: str
    data: Optional[Transaction] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AIInsightResponse(BaseModel):
    """AI insight response."""
    success: bool = True
    message: str
    data: Optional[AIPortfolioInsight] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PortfolioListResponse(BaseModel):
    """Portfolio list response."""
    success: bool = True
    message: str
    data: List[Portfolio]
    total: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PortfolioSummaryResponse(BaseModel):
    """Portfolio summary response for dashboard."""
    success: bool = True
    message: str
    data: PortfolioSummary
    ai_insights: Optional[List[AIPortfolioInsight]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PortfolioAnalyticsResponse(BaseModel):
    """Portfolio analytics response."""
    success: bool = True
    message: str
    data: PortfolioAnalytics
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Dashboard and performance schemas
class PerformanceMetrics(BaseModel):
    """Portfolio performance metrics that match frontend expectations."""
    total_return: float
    total_return_percentage: float
    day_return: float
    day_return_percentage: float
    week_return: float
    week_return_percentage: float
    month_return: float
    month_return_percentage: float
    year_return: float
    year_return_percentage: float
    sharpe_ratio: Optional[float] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    max_drawdown: Optional[float] = None


class MarketSummary(BaseModel):
    """Market summary data that matches frontend expectations."""
    market_status: str  # 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS'
    market_close_time: Optional[str] = None
    sp500_price: float
    sp500_change: float
    sp500_change_percentage: float
    nasdaq_price: float
    nasdaq_change: float
    nasdaq_change_percentage: float
    dow_price: float
    dow_change: float
    dow_change_percentage: float


class DashboardSummary(BaseModel):
    """Complete dashboard summary that matches frontend expectations."""
    portfolio: Portfolio
    positions: List[PortfolioPosition]
    recent_transactions: List[Transaction]
    ai_insights: List[AIPortfolioInsight]
    market_summary: MarketSummary
    performance_metrics: PerformanceMetrics
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        } 