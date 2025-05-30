"""
Portfolio Service
Business logic layer for portfolio management with event-driven architecture.
Implements enterprise-grade portfolio calculations and AI insights.
"""
import asyncio
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status, BackgroundTasks

from app.models.portfolio import (
    Portfolio as PortfolioModel, PortfolioPosition as PortfolioPositionModel, 
    Transaction as TransactionModel, AIPortfolioInsight as AIPortfolioInsightModel, 
    PortfolioSnapshot
)
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioSummary, 
    PortfolioPositionCreate, PortfolioPositionUpdate, TransactionCreate,
    AIPortfolioInsight as AIInsightSchema, PositionType, TransactionType, PortfolioStatus,
    PortfolioResponse, PortfolioDetailResponse, PortfolioPositionResponse,
    TransactionResponse, AIInsightResponse, DashboardSummary, PerformanceMetrics, MarketSummary,
    Portfolio as PortfolioSchema, PortfolioPosition as PortfolioPositionSchema,
    Transaction as TransactionSchema, AIPortfolioInsight as AIPortfolioInsightSchema
)
from app.services.market_data import MarketDataService
from app.services.ai_analysis import AIAnalysisService
from app.services.api_keys import APIKeyService
from app.core.events import EventBus, emit_portfolio_event, PortfolioEvent
from app.core.database import get_db

logger = logging.getLogger(__name__)


class PortfolioCalculationError(Exception):
    """Custom exception for portfolio calculation errors."""
    pass


class PortfolioService:
    """
    Portfolio service implementing enterprise-grade portfolio management.
    
    Features:
    - Real-time portfolio calculations
    - Event-driven architecture
    - AI-powered insights
    - Compliance and audit trails
    - Performance tracking
    """
    
    def __init__(
        self, 
        db: AsyncSession,
        market_data_service: Optional[MarketDataService] = None,
        ai_service: Optional[AIAnalysisService] = None,
        event_bus: Optional[EventBus] = None,
        api_key_service: Optional[APIKeyService] = None
    ):
        self.db = db
        self.market_data_service = market_data_service
        self.ai_service = ai_service
        self.event_bus = event_bus
        self.api_key_service = api_key_service
        
    async def create_portfolio(
        self, 
        user_id: UUID, 
        portfolio_data: PortfolioCreate
    ) -> PortfolioResponse:
        """
        Create a new portfolio with proper initialization.
        
        Args:
            user_id: User ID who owns the portfolio
            portfolio_data: Portfolio creation data
            
        Returns:
            Created portfolio
            
        Raises:
            IntegrityError: If portfolio name already exists for user
        """
        try:
            # Check for duplicate portfolio names for user
            existing = await self.db.execute(
                select(PortfolioModel).where(
                    and_(
                        PortfolioModel.user_id == user_id,
                        PortfolioModel.name == portfolio_data.name,
                        PortfolioModel.status == PortfolioStatus.ACTIVE
                    )
                )
            )
            
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Portfolio with this name already exists"
                )
            
            portfolio = PortfolioModel(
                user_id=user_id,
                name=portfolio_data.name,
                description=portfolio_data.description,
                cash_balance=portfolio_data.cash_balance or Decimal('0.00'),
                total_invested=Decimal('0.00'),
                total_value=portfolio_data.cash_balance or Decimal('0.00'),
                total_pnl=Decimal('0.00'),
                total_pnl_percentage=Decimal('0.00'),
                day_pnl=Decimal('0.00'),
                day_pnl_percentage=Decimal('0.00')
            )
            
            self.db.add(portfolio)
            await self.db.commit()
            await self.db.refresh(portfolio)
            
            # Emit portfolio created event
            await emit_portfolio_event(
                PortfolioEvent.CREATED,
                str(portfolio.id),
                user_id=str(user_id),
                name=portfolio_data.name
            )
            
            logger.info(f"Portfolio created: {portfolio.id} for user {user_id}")
            return PortfolioResponse.from_orm(portfolio)
            
        except IntegrityError as e:
            await self.db.rollback()
            logger.error(f"Failed to create portfolio: {e}")
            raise ValueError("Portfolio name already exists")
    
    async def get_user_portfolios(self, user_id: UUID) -> List[PortfolioModel]:
        """Get all portfolios for a user with positions loaded."""
        stmt = (
            select(PortfolioModel)
            .options(selectinload(PortfolioModel.positions))
            .where(PortfolioModel.user_id == user_id)
            .order_by(desc(PortfolioModel.created_at))
        )
        
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def get_portfolio_by_id(
        self, 
        portfolio_id: UUID, 
        user_id: Optional[UUID] = None
    ) -> Optional[PortfolioModel]:
        """Get portfolio by ID with optional user verification."""
        conditions = [PortfolioModel.id == portfolio_id]
        if user_id:
            conditions.append(PortfolioModel.user_id == user_id)
            
        stmt = (
            select(PortfolioModel)
            .options(
                selectinload(PortfolioModel.positions),
                selectinload(PortfolioModel.insights)
            )
            .where(and_(*conditions))
        )
        
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def update_portfolio(
        self, 
        portfolio_id: UUID, 
        user_id: UUID, 
        update_data: PortfolioUpdate
    ) -> Optional[PortfolioModel]:
        """Update portfolio with audit trail."""
        portfolio = await self.get_portfolio_by_id(portfolio_id, user_id)
        if not portfolio:
            return None
            
        # Update fields
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(portfolio, field, value)
        
        portfolio.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(portfolio)
        
        # Emit portfolio updated event
        await emit_portfolio_event(
            PortfolioEvent.UPDATED,
            str(portfolio_id),
            user_id=str(user_id),
            changes=update_data.dict(exclude_unset=True)
        )
        
        return portfolio
    
    async def calculate_portfolio_metrics(self, portfolio: PortfolioModel) -> PortfolioModel:
        """
        Calculate comprehensive portfolio metrics with real-time market data.
        
        This method implements enterprise-grade financial calculations:
        - Total value and cost basis
        - Profit/Loss calculations  
        - Day change calculations
        - Position weights
        - Risk metrics
        """
        try:
            # Get current market prices for all positions
            symbols = [pos.symbol for pos in portfolio.positions if pos.quantity > 0]
            if not symbols:
                # Empty portfolio
                portfolio.total_value = Decimal('0')
                portfolio.total_cost = Decimal('0') 
                portfolio.total_pnl = Decimal('0')
                portfolio.total_pnl_percent = Decimal('0')
                portfolio.day_change = Decimal('0')
                portfolio.day_change_percent = Decimal('0')
                portfolio.last_calculated_at = datetime.utcnow()
                return portfolio
            
            # Fetch current market data
            market_data = await self.market_data_service.get_bulk_quotes(symbols)
            
            total_value = Decimal('0')
            total_cost = Decimal('0')
            day_change = Decimal('0')
            
            # Calculate metrics for each position
            for position in portfolio.positions:
                if position.quantity <= 0:
                    continue
                    
                symbol_data = market_data.get(position.symbol)
                if not symbol_data:
                    logger.warning(f"No market data for {position.symbol}")
                    continue
                
                current_price = Decimal(str(symbol_data['price']))
                previous_close = Decimal(str(symbol_data.get('previous_close', current_price)))
                
                # Update position metrics
                position.current_price = current_price
                position.market_value = (position.quantity * current_price).quantize(Decimal('0.01'))
                position.cost_basis = (position.quantity * position.average_cost).quantize(Decimal('0.01'))
                position.unrealized_pnl = position.market_value - position.cost_basis
                
                if position.cost_basis > 0:
                    position.unrealized_pnl_percent = (
                        (position.unrealized_pnl / position.cost_basis) * 100
                    ).quantize(Decimal('0.01'))
                else:
                    position.unrealized_pnl_percent = Decimal('0')
                
                position.last_updated = datetime.utcnow()
                position.price_updated_at = datetime.utcnow()
                
                # Accumulate portfolio totals
                total_value += position.market_value
                total_cost += position.cost_basis
                
                # Calculate day change for this position
                position_day_change = (
                    position.quantity * (current_price - previous_close)
                ).quantize(Decimal('0.01'))
                day_change += position_day_change
            
            # Add cash balance to total value
            total_value += portfolio.cash_balance
            
            # Calculate position weights
            for position in portfolio.positions:
                if total_value > 0 and position.quantity > 0:
                    position.weight = (
                        (position.market_value / total_value) * 100
                    ).quantize(Decimal('0.01'))
                else:
                    position.weight = Decimal('0')
            
            # Update portfolio totals
            portfolio.total_value = total_value
            portfolio.total_cost = total_cost
            portfolio.total_pnl = total_value - total_cost - portfolio.cash_balance
            
            if total_cost > 0:
                portfolio.total_pnl_percent = (
                    (portfolio.total_pnl / total_cost) * 100
                ).quantize(Decimal('0.01'))
            else:
                portfolio.total_pnl_percent = Decimal('0')
            
            portfolio.day_change = day_change
            
            if total_value - day_change > 0:
                portfolio.day_change_percent = (
                    (day_change / (total_value - day_change)) * 100
                ).quantize(Decimal('0.01'))
            else:
                portfolio.day_change_percent = Decimal('0')
            
            portfolio.last_calculated_at = datetime.utcnow()
            
            await self.db.commit()
            
            # Emit portfolio metrics updated event
            await emit_portfolio_event(
                PortfolioEvent.METRICS_UPDATED,
                str(portfolio.id),
                total_value=float(portfolio.total_value),
                day_change=float(portfolio.day_change),
                total_pnl=float(portfolio.total_pnl)
            )
            
            return portfolio
            
        except Exception as e:
            logger.error(f"Error calculating portfolio metrics: {e}")
            await self.db.rollback()
            raise PortfolioCalculationError(f"Failed to calculate portfolio metrics: {e}")
    
    async def get_portfolio_summary(self, user_id: UUID) -> Optional[DashboardSummary]:
        """
        Get complete portfolio summary for dashboard display.
        
        Returns the full dashboard data including portfolio, positions, transactions, 
        AI insights, market data, and performance metrics.
        """
        try:
            # Get user's primary portfolio (first active portfolio)
            stmt = (
                select(PortfolioModel)
                .options(selectinload(PortfolioModel.positions))
                .where(
                    and_(
                        PortfolioModel.user_id == user_id,
                        PortfolioModel.status == PortfolioStatus.ACTIVE
                    )
                )
                .order_by(desc(PortfolioModel.created_at))
                .limit(1)
            )
            
            result = await self.db.execute(stmt)
            portfolio = result.scalar_one_or_none()
            
            if not portfolio:
                # Create default portfolio if none exists
                default_portfolio_data = PortfolioCreate(
                    name="My Portfolio",
                    description="Default investment portfolio",
                    cash_balance=Decimal('10000.00')  # Start with $10k demo money
                )
                
                new_portfolio = PortfolioModel(
                    user_id=user_id,
                    name=default_portfolio_data.name,
                    description=default_portfolio_data.description,
                    cash_balance=default_portfolio_data.cash_balance,
                    total_invested=Decimal('0.00'),
                    total_value=default_portfolio_data.cash_balance,
                    total_pnl=Decimal('0.00'),
                    total_pnl_percentage=Decimal('0.00'),
                    day_pnl=Decimal('0.00'),
                    day_pnl_percentage=Decimal('0.00')
                )
                
                self.db.add(new_portfolio)
                await self.db.commit()
                await self.db.refresh(new_portfolio)
                portfolio = new_portfolio
                
                # Create some demo positions for the default portfolio
                await self._create_demo_positions(portfolio)
            
            # Update portfolio metrics with current market data (if market service available)
            if self.market_data_service:
                try:
                    portfolio = await self.calculate_portfolio_metrics(portfolio)
                except Exception as e:
                    logger.warning(f"Could not update portfolio metrics: {e}")
            
            # Get recent transactions
            transactions_stmt = (
                select(TransactionModel)
                .where(TransactionModel.portfolio_id == portfolio.id)
                .order_by(desc(TransactionModel.transaction_date))
                .limit(10)
            )
            transactions_result = await self.db.execute(transactions_stmt)
            recent_transactions = transactions_result.scalars().all()
            
            # Get AI insights
            insights_stmt = (
                select(AIPortfolioInsightModel)
                .where(
                    and_(
                        AIPortfolioInsightModel.portfolio_id == portfolio.id,
                        or_(
                            AIPortfolioInsightModel.expires_at.is_(None),
                            AIPortfolioInsightModel.expires_at > datetime.utcnow()
                        )
                    )
                )
                .order_by(desc(AIPortfolioInsightModel.created_at))
                .limit(5)
            )
            insights_result = await self.db.execute(insights_stmt)
            ai_insights = insights_result.scalars().all()
            
            # Create market summary (mock data for now, real data when market service ready)
            market_summary = MarketSummary(
                market_status="OPEN",
                market_close_time=None,
                sp500_price=4850.23,
                sp500_change=12.45,
                sp500_change_percentage=0.26,
                nasdaq_price=15234.67,
                nasdaq_change=-45.23,
                nasdaq_change_percentage=-0.30,
                dow_price=37892.12,
                dow_change=89.34,
                dow_change_percentage=0.24
            )
            
            # Create performance metrics
            performance_metrics = PerformanceMetrics(
                total_return=float(portfolio.total_pnl),
                total_return_percentage=float(portfolio.total_pnl_percent),
                day_return=float(portfolio.day_change),
                day_return_percentage=float(portfolio.day_change_percent),
                week_return=float(portfolio.total_pnl * Decimal('0.7')),  # Mock weekly data
                week_return_percentage=float(portfolio.total_pnl_percent * Decimal('0.7')),
                month_return=float(portfolio.total_pnl * Decimal('1.2')),  # Mock monthly data
                month_return_percentage=float(portfolio.total_pnl_percent * Decimal('1.2')),
                year_return=float(portfolio.total_pnl * Decimal('2.1')),  # Mock yearly data
                year_return_percentage=float(portfolio.total_pnl_percent * Decimal('2.1')),
                sharpe_ratio=1.25,
                volatility=18.5,
                beta=1.15,
                max_drawdown=-8.2
            )
            
            # Build complete dashboard summary with proper schema conversion
            dashboard_summary = DashboardSummary(
                portfolio=PortfolioSchema.from_orm(portfolio),  # Convert DB model to Pydantic schema
                positions=[PortfolioPositionSchema.from_orm(pos) for pos in portfolio.positions],  # Convert each position
                recent_transactions=[TransactionSchema.from_orm(txn) for txn in recent_transactions],  # Convert transactions
                ai_insights=[AIPortfolioInsightSchema.from_orm(insight) for insight in ai_insights],  # Convert insights
                market_summary=market_summary,  # Already a Pydantic object
                performance_metrics=performance_metrics  # Already a Pydantic object
            )
            
            return dashboard_summary
            
        except Exception as e:
            logger.error(f"Error getting portfolio summary for user {user_id}: {e}")
            # Return None to trigger 404 handling in the API
            return None
    
    async def _create_demo_positions(self, portfolio: PortfolioModel):
        """Create some demo positions for new portfolios."""
        try:
            demo_positions = [
                {
                    "symbol": "AAPL",
                    "quantity": Decimal('10'),
                    "average_cost": Decimal('175.50'),
                    "current_price": Decimal('182.30')
                },
                {
                    "symbol": "MSFT", 
                    "quantity": Decimal('15'),
                    "average_cost": Decimal('380.75'),
                    "current_price": Decimal('395.20')
                },
                {
                    "symbol": "GOOGL",
                    "quantity": Decimal('5'),
                    "average_cost": Decimal('145.20'),
                    "current_price": Decimal('152.80')
                }
            ]
            
            for pos_data in demo_positions:
                position = PortfolioPositionModel(
                    portfolio_id=portfolio.id,
                    symbol=pos_data["symbol"],
                    quantity=pos_data["quantity"],
                    average_cost=pos_data["average_cost"],
                    current_price=pos_data["current_price"],
                    market_value=pos_data["quantity"] * pos_data["current_price"],
                    total_cost=pos_data["quantity"] * pos_data["average_cost"],
                    unrealized_pnl=(pos_data["quantity"] * pos_data["current_price"]) - (pos_data["quantity"] * pos_data["average_cost"]),
                    weight_percentage=Decimal('0.00')  # Will be calculated later
                )
                
                # Calculate unrealized P&L percentage
                if position.total_cost > 0:
                    position.unrealized_pnl_percentage = (position.unrealized_pnl / position.total_cost * 100).quantize(Decimal('0.01'))
                
                self.db.add(position)
            
            # Update portfolio totals
            total_market_value = sum(pos_data["quantity"] * pos_data["current_price"] for pos_data in demo_positions)
            total_cost = sum(pos_data["quantity"] * pos_data["average_cost"] for pos_data in demo_positions)
            
            portfolio.total_invested = total_cost
            portfolio.total_value = total_market_value + portfolio.cash_balance
            portfolio.total_pnl = total_market_value - total_cost
            
            if total_cost > 0:
                portfolio.total_pnl_percentage = (portfolio.total_pnl / total_cost * 100).quantize(Decimal('0.01'))
            
            # Mock some daily change
            portfolio.day_pnl = total_market_value * Decimal('0.015')  # 1.5% daily gain
            if portfolio.total_value > 0:
                portfolio.day_pnl_percentage = (portfolio.day_pnl / portfolio.total_value * 100).quantize(Decimal('0.01'))
            
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Error creating demo positions: {e}")
            await self.db.rollback()
    
    async def generate_ai_insights(self, portfolio: PortfolioModel) -> List[AIPortfolioInsightModel]:
        """
        Generate AI-powered portfolio insights and recommendations.
        
        This method integrates with AI services to provide:
        - Portfolio performance analysis
        - Risk assessment
        - Diversification recommendations
        - Market opportunity alerts
        """
        try:
            # Prepare portfolio data for AI analysis
            portfolio_data = {
                'total_value': float(portfolio.total_value),
                'total_pnl': float(portfolio.total_pnl),
                'total_pnl_percent': float(portfolio.total_pnl_percent),
                'day_change': float(portfolio.day_change),
                'day_change_percent': float(portfolio.day_change_percent),
                'positions': [
                    {
                        'symbol': pos.symbol,
                        'quantity': float(pos.quantity),
                        'market_value': float(pos.market_value),
                        'unrealized_pnl_percent': float(pos.unrealized_pnl_percent),
                        'weight': float(pos.weight)
                    }
                    for pos in portfolio.positions if pos.quantity > 0
                ]
            }
            
            # Generate AI insights
            insights_data = await self.ai_service.analyze_portfolio(portfolio_data)
            
            insights = []
            for insight_data in insights_data:
                insight = AIPortfolioInsightModel(
                    portfolio_id=portfolio.id,
                    insight_type=insight_data['type'],
                    title=insight_data['title'],
                    content=insight_data['content'],
                    confidence_score=Decimal(str(insight_data['confidence'])),
                    tags=insight_data.get('tags', []),
                    action_required=insight_data.get('action_required', False),
                    model_name=insight_data.get('model', 'default'),
                    expires_at=datetime.utcnow() + timedelta(days=7)  # Insights expire in 7 days
                )
                
                self.db.add(insight)
                insights.append(insight)
            
            await self.db.commit()
            
            # Emit AI insights generated event
            await emit_portfolio_event(
                PortfolioEvent.AI_INSIGHTS_GENERATED,
                str(portfolio.id),
                insights_count=len(insights),
                high_priority_count=len([i for i in insights if i.action_required])
            )
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            await self.db.rollback()
            return []
    
    async def add_position(
        self, 
        portfolio_id: UUID, 
        user_id: UUID, 
        position_data: PortfolioPositionCreate
    ) -> Optional[PortfolioPositionModel]:
        """Add or update a portfolio position."""
        portfolio = await self.get_portfolio_by_id(portfolio_id, user_id)
        if not portfolio:
            return None
        
        # Check if position already exists
        stmt = select(PortfolioPositionModel).where(
            and_(
                PortfolioPositionModel.portfolio_id == portfolio_id,
                PortfolioPositionModel.symbol == position_data.symbol.upper()
            )
        )
        
        result = await self.db.execute(stmt)
        existing_position = result.scalar_one_or_none()
        
        if existing_position:
            # Update existing position using weighted average cost
            total_quantity = existing_position.quantity + position_data.quantity
            if total_quantity > 0:
                existing_position.average_cost = (
                    (existing_position.quantity * existing_position.average_cost + 
                     position_data.quantity * position_data.average_cost) / total_quantity
                ).quantize(Decimal('0.01'))
                existing_position.quantity = total_quantity
                existing_position.updated_at = datetime.utcnow()
                
                await self.db.commit()
                return existing_position
        else:
            # Create new position
            position = PortfolioPositionModel(
                portfolio_id=portfolio_id,
                symbol=position_data.symbol.upper(),
                position_type=position_data.position_type,
                quantity=position_data.quantity,
                average_cost=position_data.average_cost,
                current_price=position_data.current_price
            )
            
            self.db.add(position)
            await self.db.commit()
            await self.db.refresh(position)
            
            return position
    
    async def create_snapshot(self, portfolio: PortfolioModel) -> PortfolioSnapshot:
        """Create a historical snapshot of portfolio state."""
        positions_data = [
            {
                'symbol': pos.symbol,
                'quantity': float(pos.quantity),
                'price': float(pos.current_price or 0),
                'market_value': float(pos.market_value),
                'weight': float(pos.weight)
            }
            for pos in portfolio.positions if pos.quantity > 0
        ]
        
        snapshot = PortfolioSnapshot(
            portfolio_id=portfolio.id,
            snapshot_date=date.today(),
            total_value=portfolio.total_value,
            total_cost=portfolio.total_cost,
            cash_balance=portfolio.cash_balance,
            positions_data=positions_data,
            day_return=portfolio.day_change,
            day_return_percent=portfolio.day_change_percent,
            total_return=portfolio.total_pnl,
            total_return_percent=portfolio.total_pnl_percent
        )
        
        self.db.add(snapshot)
        await self.db.commit()
        
        return snapshot 

    async def get_dashboard_summary(
        self,
        user_id: UUID,
        background_tasks: BackgroundTasks
    ) -> DashboardSummary:
        """
        Get comprehensive dashboard summary with real-time data
        """
        try:
            # Get user's portfolios
            portfolios_result = await self.db.execute(
                select(PortfolioModel).where(
                    and_(PortfolioModel.user_id == user_id, PortfolioModel.status == PortfolioStatus.ACTIVE)
                ).options(selectinload(PortfolioModel.positions))
            )
            portfolios = portfolios_result.scalars().all()
            
            if not portfolios:
                # Return empty dashboard for users with no portfolios
                return DashboardSummary(
                    total_value=Decimal('0.00'),
                    total_invested=Decimal('0.00'),
                    total_pnl=Decimal('0.00'),
                    total_pnl_percentage=Decimal('0.00'),
                    day_pnl=Decimal('0.00'),
                    day_pnl_percentage=Decimal('0.00'),
                    cash_balance=Decimal('0.00'),
                    portfolios=[],
                    recent_transactions=[],
                    ai_insights=[],
                    performance_metrics=PerformanceMetrics(
                        sharpe_ratio=Decimal('0.00'),
                        max_drawdown=Decimal('0.00'),
                        volatility=Decimal('0.00'),
                        beta=Decimal('1.00'),
                        alpha=Decimal('0.00')
                    ),
                    market_summary=MarketSummary(
                        market_status="UNKNOWN",
                        major_indices=[],
                        market_sentiment="neutral",
                        trending_stocks=[]
                    )
                )
            
            # Calculate aggregated metrics
            total_value = sum(p.total_value for p in portfolios)
            total_invested = sum(p.total_invested for p in portfolios)
            total_pnl = sum(p.total_pnl for p in portfolios)
            total_pnl_percentage = (total_pnl / total_invested * 100) if total_invested > 0 else Decimal('0.00')
            day_pnl = sum(p.day_pnl for p in portfolios)
            day_pnl_percentage = (day_pnl / total_value * 100) if total_value > 0 else Decimal('0.00')
            cash_balance = sum(p.cash_balance for p in portfolios)
            
            # Get recent transactions
            recent_transactions_result = await self.db.execute(
                select(TransactionModel).where(
                    TransactionModel.portfolio_id.in_([p.id for p in portfolios])
                ).order_by(desc(TransactionModel.transaction_date)).limit(10)
            )
            recent_transactions = [
                TransactionSchema.from_orm(t) 
                for t in recent_transactions_result.scalars().all()
            ]
            
            # Get AI insights
            ai_insights_result = await self.db.execute(
                select(AIPortfolioInsightModel).where(
                    AIPortfolioInsightModel.portfolio_id.in_([p.id for p in portfolios])
                ).order_by(desc(AIPortfolioInsightModel.created_at)).limit(5)
            )
            ai_insights = [
                AIInsightSchema.from_orm(insight)
                for insight in ai_insights_result.scalars().all()
            ]
            
            # Update portfolio values in background with real market data
            background_tasks.add_task(
                self._update_portfolio_values_background,
                self.db, user_id, [p.id for p in portfolios]
            )
            
            # Generate AI insights in background if none exist recently
            if not ai_insights:
                background_tasks.add_task(
                    self._generate_ai_insights_background,
                    self.db, user_id, [p.id for p in portfolios]
                )
            
            # Get market summary (cached/static for now, real-time in background)
            market_summary = await self._get_market_summary(self.db, user_id)
            
            return DashboardSummary(
                total_value=total_value,
                total_invested=total_invested,
                total_pnl=total_pnl,
                total_pnl_percentage=total_pnl_percentage,
                day_pnl=day_pnl,
                day_pnl_percentage=day_pnl_percentage,
                cash_balance=cash_balance,
                portfolios=[PortfolioSchema.from_orm(p) for p in portfolios],
                recent_transactions=recent_transactions,
                ai_insights=ai_insights,
                performance_metrics=PerformanceMetrics(
                    sharpe_ratio=Decimal('1.25'),  # Would be calculated from historical data
                    max_drawdown=Decimal('-12.5'),
                    volatility=Decimal('18.2'),
                    beta=Decimal('1.15'),
                    alpha=Decimal('3.8')
                ),
                market_summary=market_summary
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard summary for user {user_id}: {e}")
            # Return a basic error state instead of failing completely
            return DashboardSummary(
                total_value=Decimal('0.00'),
                total_invested=Decimal('0.00'),
                total_pnl=Decimal('0.00'),
                total_pnl_percentage=Decimal('0.00'),
                day_pnl=Decimal('0.00'),
                day_pnl_percentage=Decimal('0.00'),
                cash_balance=Decimal('0.00'),
                portfolios=[],
                recent_transactions=[],
                ai_insights=[],
                performance_metrics=PerformanceMetrics(
                    sharpe_ratio=Decimal('0.00'),
                    max_drawdown=Decimal('0.00'),
                    volatility=Decimal('0.00'),
                    beta=Decimal('1.00'),
                    alpha=Decimal('0.00')
                ),
                market_summary=MarketSummary(
                    market_status="ERROR",
                    major_indices=[],
                    market_sentiment="neutral",
                    trending_stocks=[]
                )
            )
    
    async def _update_portfolio_values_background(
        self, 
        db: AsyncSession, 
        user_id: UUID, 
        portfolio_ids: List[UUID]
    ):
        """Background task to update portfolio values with real market data"""
        try:
            for portfolio_id in portfolio_ids:
                await self._update_single_portfolio_value(db, user_id, portfolio_id)
        except Exception as e:
            logger.error(f"Background portfolio value update failed: {e}")
    
    async def _update_single_portfolio_value(
        self, 
        db: AsyncSession, 
        user_id: UUID, 
        portfolio_id: UUID
    ):
        """Update a single portfolio's value with real market data"""
        try:
            # Get portfolio with positions
            result = await db.execute(
                select(PortfolioModel).where(PortfolioModel.id == portfolio_id)
                .options(selectinload(PortfolioModel.positions))
            )
            portfolio = result.scalar_one_or_none()
            
            if not portfolio:
                return
            
            total_market_value = Decimal('0.00')
            
            # Update each position with current market price
            for position in portfolio.positions:
                try:
                    # Get API key for market data provider
                    api_key = await self.api_key_service.get_api_key_for_provider(
                        db, user_id, 'fmp'  # Try Financial Modeling Prep first
                    )
                    
                    if not api_key:
                        # Try Alpha Vantage as fallback
                        api_key = await self.api_key_service.get_api_key_for_provider(
                            db, user_id, 'alpha_vantage'
                        )
                    
                    if api_key:
                        # Get real-time price
                        current_price = await self.market_data_service.get_current_price(
                            position.symbol, api_key
                        )
                        
                        if current_price:
                            # Update position
                            old_price = position.current_price
                            position.current_price = current_price
                            position.market_value = position.quantity * current_price
                            position.unrealized_pnl = position.market_value - position.total_cost
                            position.unrealized_pnl_percentage = (
                                (position.unrealized_pnl / position.total_cost * 100) 
                                if position.total_cost > 0 else Decimal('0.00')
                            )
                            
                            # Calculate daily change
                            if old_price and old_price > 0:
                                daily_change = current_price - old_price
                                position.day_pnl = position.quantity * daily_change
                                position.day_pnl_percentage = (daily_change / old_price * 100)
                            
                            position.updated_at = datetime.utcnow()
                            
                    total_market_value += position.market_value
                    
                except Exception as e:
                    logger.error(f"Error updating position {position.symbol}: {e}")
                    # Use existing market value if update fails
                    total_market_value += position.market_value
            
            # Update portfolio totals
            portfolio.total_value = total_market_value + portfolio.cash_balance
            portfolio.total_pnl = total_market_value - portfolio.total_invested
            portfolio.total_pnl_percentage = (
                (portfolio.total_pnl / portfolio.total_invested * 100)
                if portfolio.total_invested > 0 else Decimal('0.00')
            )
            
            # Calculate day P&L
            day_pnl = sum(pos.day_pnl for pos in portfolio.positions)
            portfolio.day_pnl = day_pnl
            portfolio.day_pnl_percentage = (
                (day_pnl / portfolio.total_value * 100)
                if portfolio.total_value > 0 else Decimal('0.00')
            )
            
            portfolio.updated_at = datetime.utcnow()
            
            await db.commit()
            
            # Emit event
            await emit_portfolio_event(
                PortfolioEvent.METRICS_UPDATED,
                str(portfolio_id),
                total_value=float(portfolio.total_value),
                day_change=float(portfolio.day_pnl)
            )
            
        except Exception as e:
            logger.error(f"Error updating portfolio {portfolio_id} value: {e}")
    
    async def _generate_ai_insights_background(
        self,
        db: AsyncSession,
        user_id: UUID,
        portfolio_ids: List[UUID]
    ):
        """Background task to generate AI insights for portfolios"""
        try:
            for portfolio_id in portfolio_ids:
                await self._generate_single_portfolio_insights(db, user_id, portfolio_id)
        except Exception as e:
            logger.error(f"Background AI insights generation failed: {e}")
    
    async def _generate_single_portfolio_insights(
        self,
        db: AsyncSession,
        user_id: UUID,
        portfolio_id: UUID
    ):
        """Generate AI insights for a single portfolio"""
        try:
            # Get portfolio data
            result = await db.execute(
                select(PortfolioModel).where(PortfolioModel.id == portfolio_id)
                .options(selectinload(PortfolioModel.positions))
            )
            portfolio = result.scalar_one_or_none()
            
            if not portfolio:
                return
            
            # Get API key for AI provider
            ai_api_key = await self.api_key_service.get_api_key_for_provider(
                db, user_id, 'openai'
            )
            
            if not ai_api_key:
                # Try Anthropic as fallback
                ai_api_key = await self.api_key_service.get_api_key_for_provider(
                    db, user_id, 'anthropic'
                )
            
            if ai_api_key:
                # Generate insights using AI service
                insights = await self.ai_service.analyze_portfolio(
                    portfolio, ai_api_key
                )
                
                # Save insights to database
                for insight_data in insights:
                    db_insight = AIPortfolioInsightModel(
                        portfolio_id=portfolio_id,
                        insight_type=insight_data.get('type', 'general'),
                        title=insight_data.get('title', 'Portfolio Analysis'),
                        content=insight_data.get('content', ''),
                        confidence_score=Decimal(str(insight_data.get('confidence', 0.8))),
                        priority=insight_data.get('priority', 'medium'),
                        action_required=insight_data.get('action_required', False),
                        metadata=insight_data.get('metadata', {})
                    )
                    db.add(db_insight)
                
                await db.commit()
                
                # Emit event
                await emit_portfolio_event(
                    PortfolioEvent.AI_INSIGHTS_GENERATED,
                    str(portfolio_id),
                    insights_count=len(insights),
                    high_priority_count=sum(1 for i in insights if i.get('priority') == 'high')
                )
            
        except Exception as e:
            logger.error(f"Error generating AI insights for portfolio {portfolio_id}: {e}")
    
    async def _get_market_summary(self, db: AsyncSession, user_id: UUID) -> MarketSummary:
        """Get market summary with real-time data when possible"""
        try:
            # Get API key for market data
            api_key = await self.api_key_service.get_api_key_for_provider(
                db, user_id, 'fmp'
            )
            
            if api_key:
                # Get real market data
                market_data = await self.market_data_service.get_market_summary(api_key)
                if market_data:
                    return market_data
            
            # Fallback to static/cached data
            return MarketSummary(
                market_status="OPEN",
                major_indices=[
                    {"symbol": "SPY", "price": Decimal("485.23"), "change": Decimal("2.45"), "change_pct": Decimal("0.51")},
                    {"symbol": "QQQ", "price": Decimal("412.67"), "change": Decimal("-1.23"), "change_pct": Decimal("-0.30")},
                    {"symbol": "IWM", "price": Decimal("201.89"), "change": Decimal("0.87"), "change_pct": Decimal("0.43")}
                ],
                market_sentiment="bullish",
                trending_stocks=[
                    {"symbol": "AAPL", "change_pct": Decimal("3.2")},
                    {"symbol": "TSLA", "change_pct": Decimal("-2.1")},
                    {"symbol": "NVDA", "change_pct": Decimal("5.4")}
                ]
            )
            
        except Exception as e:
            logger.error(f"Error getting market summary: {e}")
            return MarketSummary(
                market_status="UNKNOWN",
                major_indices=[],
                market_sentiment="neutral",
                trending_stocks=[]
            )
    
    # Additional portfolio management methods...
    async def get_portfolio_detail(
        self,
        user_id: UUID,
        portfolio_id: UUID
    ) -> PortfolioDetailResponse:
        """Get detailed portfolio information"""
        
        result = await self.db.execute(
            select(PortfolioModel).where(
                and_(
                    PortfolioModel.id == portfolio_id,
                    PortfolioModel.user_id == user_id,
                    PortfolioModel.status == PortfolioStatus.ACTIVE
                )
            ).options(
                selectinload(PortfolioModel.positions),
                selectinload(PortfolioModel.transactions),
                selectinload(PortfolioModel.ai_insights)
            )
        )
        
        portfolio = result.scalar_one_or_none()
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return PortfolioDetailResponse.from_orm(portfolio) 