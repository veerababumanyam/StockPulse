"""
Portfolio API Endpoints
FastAPI endpoints for portfolio management with enterprise features.
Implements proper authentication, validation, and error handling.
"""
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser
from app.models.user import User
from app.schemas.portfolio import (
    Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioSummary,
    PortfolioSummaryResponse, PortfolioResponse, PortfolioListResponse,
    PortfolioAnalytics, PortfolioAnalyticsResponse,
    PortfolioPosition, PortfolioPositionCreate, PortfolioPositionUpdate,
    AIPortfolioInsight, DashboardSummary
)
from app.services.portfolio import PortfolioService, PortfolioCalculationError
from app.services.market_data import MarketDataService
from app.services.ai_analysis import AIAnalysisService
from app.core.events import event_bus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# Dependency injection for services
async def get_portfolio_service(db: AsyncSession = Depends(get_db)) -> PortfolioService:
    """Get portfolio service with dependencies."""
    # Simplified service initialization for MVP
    # TODO: Re-enable full service integration when dependencies are stable
    try:
        # For now, create a minimal portfolio service without complex dependencies
        return PortfolioService(
            db=db,
            market_data_service=None,  # Will be None for now
            ai_service=None,  # Will be None for now
            event_bus=None,  # Will be None for now
            api_key_service=None  # Will be None for now
        )
    except Exception as e:
        logger.error(f"Error creating portfolio service: {e}")
        # Return a minimal service that can handle basic operations
        return PortfolioService(
            db=db,
            market_data_service=None,
            ai_service=None,
            event_bus=None,
            api_key_service=None
        )


# Portfolio Management Endpoints
@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """
    Create a new portfolio for the authenticated user.
    
    - **name**: Portfolio name (required)
    - **description**: Portfolio description (optional)
    - **currency**: Base currency (default: USD)
    - **status**: Portfolio status (default: active)
    """
    try:
        portfolio = await portfolio_service.create_portfolio(
            user_id=current_user.id,
            portfolio_data=portfolio_data
        )
        
        # Background task for post-creation setup
        background_tasks.add_task(
            _setup_new_portfolio,
            portfolio.id,
            current_user.id
        )
        
        return PortfolioResponse(
            message="Portfolio created successfully",
            data=portfolio
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portfolio"
        )


@router.get("/", response_model=PortfolioListResponse)
async def get_user_portfolios(
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get all portfolios for the authenticated user."""
    try:
        portfolios = await portfolio_service.get_user_portfolios(current_user.id)
        
        return PortfolioListResponse(
            message="Portfolios retrieved successfully",
            data=portfolios,
            total=len(portfolios)
        )
        
    except Exception as e:
        logger.error(f"Error fetching portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolios"
        )


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get a specific portfolio by ID."""
    try:
        portfolio = await portfolio_service.get_portfolio_by_id(
            portfolio_id=portfolio_id,
            user_id=current_user.id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return PortfolioResponse(
            message="Portfolio retrieved successfully",
            data=portfolio
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolio"
        )


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: UUID,
    update_data: PortfolioUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Update portfolio details."""
    try:
        portfolio = await portfolio_service.update_portfolio(
            portfolio_id=portfolio_id,
            user_id=current_user.id,
            update_data=update_data
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return PortfolioResponse(
            message="Portfolio updated successfully",
            data=portfolio
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating portfolio {portfolio_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update portfolio"
        )


# Portfolio Summary and Analytics Endpoints
@router.get("/summary/dashboard", response_model=DashboardSummary)
async def get_portfolio_summary(
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service),
    include_ai_insights: bool = Query(default=True, description="Include AI insights in response")
):
    """
    Get portfolio summary for dashboard display.
    
    This endpoint provides the primary portfolio data needed for the dashboard:
    - Complete portfolio information with positions
    - Recent transactions
    - AI insights
    - Market summary
    - Performance metrics
    """
    try:
        summary = await portfolio_service.get_portfolio_summary(current_user.id)
        
        if not summary:
            # This should not happen as service creates default portfolio
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No portfolio found"
            )
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolio summary"
        )


@router.get("/{portfolio_id}/analytics", response_model=PortfolioAnalyticsResponse)
async def get_portfolio_analytics(
    portfolio_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get detailed analytics for a portfolio."""
    try:
        portfolio = await portfolio_service.get_portfolio_by_id(
            portfolio_id=portfolio_id,
            user_id=current_user.id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        # Calculate current metrics
        portfolio = await portfolio_service.calculate_portfolio_metrics(portfolio)
        
        # Build analytics response
        analytics = PortfolioAnalytics(
            portfolio_id=portfolio.id,
            total_value=portfolio.total_value,
            asset_allocation=_calculate_asset_allocation(portfolio),
            sector_allocation=_calculate_sector_allocation(portfolio),
            top_holdings=_get_top_holdings(portfolio),
            performance_metrics=_calculate_performance_metrics(portfolio),
            risk_metrics=_calculate_risk_metrics(portfolio),
            generated_at=datetime.utcnow()
        )
        
        return PortfolioAnalyticsResponse(
            message="Portfolio analytics retrieved successfully",
            data=analytics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolio analytics"
        )


@router.post("/{portfolio_id}/calculate", response_model=PortfolioResponse)
async def recalculate_portfolio_metrics(
    portfolio_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Manually trigger portfolio metrics recalculation."""
    try:
        portfolio = await portfolio_service.get_portfolio_by_id(
            portfolio_id=portfolio_id,
            user_id=current_user.id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        portfolio = await portfolio_service.calculate_portfolio_metrics(portfolio)
        
        return PortfolioResponse(
            message="Portfolio metrics recalculated successfully",
            data=portfolio
        )
        
    except PortfolioCalculationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Calculation error: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recalculating portfolio metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to recalculate portfolio metrics"
        )


# Position Management Endpoints
@router.post("/{portfolio_id}/positions", response_model=PortfolioResponse)
async def add_position(
    portfolio_id: UUID,
    position_data: PortfolioPositionCreate,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Add a new position to the portfolio."""
    try:
        position = await portfolio_service.add_position(
            portfolio_id=portfolio_id,
            user_id=current_user.id,
            position_data=position_data
        )
        
        if not position:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        # Get updated portfolio
        portfolio = await portfolio_service.get_portfolio_by_id(
            portfolio_id=portfolio_id,
            user_id=current_user.id
        )
        
        return PortfolioResponse(
            message="Position added successfully",
            data=portfolio
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding position: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add position"
        )


# AI Insights Endpoints
@router.post("/{portfolio_id}/insights/generate")
async def generate_ai_insights(
    portfolio_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Generate AI insights for the portfolio."""
    try:
        portfolio = await portfolio_service.get_portfolio_by_id(
            portfolio_id=portfolio_id,
            user_id=current_user.id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        # Generate insights in background
        background_tasks.add_task(
            _generate_insights_background,
            portfolio_service,
            portfolio
        )
        
        return {"message": "AI insights generation started"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI insights"
        )


# Helper functions
async def _setup_new_portfolio(portfolio_id: UUID, user_id: UUID):
    """Background task for new portfolio setup."""
    try:
        # Add any post-creation setup here
        # - Create default positions
        # - Setup alerts
        # - Send welcome notifications
        logger.info(f"Setting up new portfolio {portfolio_id} for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in portfolio setup: {e}")


async def _generate_insights_background(portfolio_service: PortfolioService, portfolio):
    """Background task for AI insights generation."""
    try:
        await portfolio_service.generate_ai_insights(portfolio)
        
    except Exception as e:
        logger.error(f"Error generating insights in background: {e}")


def _calculate_asset_allocation(portfolio) -> Dict[str, Any]:
    """Calculate asset allocation by position type."""
    allocation = {}
    total_value = float(portfolio.total_value)
    
    if total_value <= 0:
        return allocation
    
    for position in portfolio.positions:
        if position.quantity > 0:
            position_type = position.position_type.value
            market_value = float(position.market_value)
            
            if position_type not in allocation:
                allocation[position_type] = 0
            allocation[position_type] += market_value
    
    # Convert to percentages
    for asset_type in allocation:
        allocation[asset_type] = (allocation[asset_type] / total_value) * 100
    
    return allocation


def _calculate_sector_allocation(portfolio) -> Dict[str, Any]:
    """Calculate sector allocation (simplified)."""
    # In a real implementation, you'd look up sector data for each symbol
    return {"Technology": 45.0, "Healthcare": 25.0, "Finance": 20.0, "Other": 10.0}


def _get_top_holdings(portfolio) -> List[Dict[str, Any]]:
    """Get top 10 holdings by market value."""
    holdings = []
    
    for position in portfolio.positions:
        if position.quantity > 0:
            holdings.append({
                "symbol": position.symbol,
                "market_value": float(position.market_value),
                "weight": float(position.weight),
                "unrealized_pnl_percent": float(position.unrealized_pnl_percent)
            })
    
    # Sort by market value and return top 10
    holdings.sort(key=lambda x: x["market_value"], reverse=True)
    return holdings[:10]


def _calculate_performance_metrics(portfolio) -> Dict[str, Any]:
    """Calculate performance metrics."""
    return {
        "total_return_percent": float(portfolio.total_pnl_percent),
        "day_return_percent": float(portfolio.day_change_percent),
        "total_return_amount": float(portfolio.total_pnl),
        "day_return_amount": float(portfolio.day_change)
    }


def _calculate_risk_metrics(portfolio) -> Dict[str, Any]:
    """Calculate risk metrics (simplified)."""
    # In a real implementation, you'd calculate proper risk metrics
    return {
        "volatility": 15.5,
        "sharpe_ratio": 1.2,
        "beta": 1.1,
        "var_95": -2.5,
        "max_drawdown": -8.2
    } 