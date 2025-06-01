"""
Financial Modeling Prep (FMP) Proxy API Endpoints
Secure proxy endpoints for FMP API calls using stored encrypted API keys
"""
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.dependencies import CurrentUser, get_current_user
from ...core.events import EventBus, get_event_bus
from ...services.api_keys import APIKeyService
from ...services.fmp_proxy import FMPProxyService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fmp", tags=["Financial Modeling Prep Proxy"])


# Dependency to get services
async def get_api_key_service(
    event_bus: EventBus = Depends(get_event_bus),
) -> APIKeyService:
    return APIKeyService(event_bus)


async def get_fmp_service(
    api_key_service: APIKeyService = Depends(get_api_key_service),
) -> FMPProxyService:
    return FMPProxyService(api_key_service)


# Portfolio Data Endpoints
@router.get("/portfolio/overview")
async def get_portfolio_overview(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get portfolio overview data

    Returns portfolio summary including total value, daily changes, and market context
    """
    try:
        data = await fmp_service.get_portfolio_overview(db, current_user.id)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get portfolio overview for user {current_user.id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio overview",
        )


@router.get("/portfolio/chart")
async def get_portfolio_chart(
    timeframe: str = Query(
        "1M", description="Chart timeframe (1D, 1W, 1M, 3M, 1Y, 5Y)"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get portfolio performance chart data

    - **timeframe**: Chart timeframe (1D, 1W, 1M, 3M, 1Y, 5Y)
    """
    try:
        data = await fmp_service.get_portfolio_chart_data(
            db, current_user.id, timeframe
        )
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get portfolio chart for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio chart data",
        )


# Market Data Endpoints
@router.get("/watchlist")
async def get_watchlist(
    symbols: Optional[str] = Query(None, description="Comma-separated list of symbols"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get watchlist data for specified symbols

    - **symbols**: Optional comma-separated list of symbols (defaults to popular stocks)
    """
    try:
        symbol_list = symbols.split(",") if symbols else None
        data = await fmp_service.get_watchlist_data(db, current_user.id, symbol_list)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get watchlist for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve watchlist data",
        )


@router.get("/market/summary")
async def get_market_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get market summary with major indices

    Returns current values and changes for major market indices
    """
    try:
        data = await fmp_service.get_market_summary(db, current_user.id)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get market summary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve market summary",
        )


@router.get("/market/sectors")
async def get_sector_performance(
    timeframe: str = Query("1D", description="Performance timeframe"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get sector performance data

    - **timeframe**: Performance timeframe (1D, 1W, 1M, etc.)
    """
    try:
        data = await fmp_service.get_sector_performance(db, current_user.id, timeframe)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to get sector performance for user {current_user.id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve sector performance",
        )


@router.get("/market/movers")
async def get_top_movers(
    market: str = Query("nasdaq", description="Market (nasdaq, nyse)"),
    type: str = Query("gainers", description="Type (gainers, losers)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get top movers (gainers/losers) for specified market

    - **market**: Market to query (nasdaq, nyse)
    - **type**: Type of movers (gainers, losers)
    """
    try:
        data = await fmp_service.get_top_movers(db, current_user.id, market, type)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get top movers for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve top movers",
        )


@router.get("/news")
async def get_news_feed(
    limit: int = Query(20, ge=1, le=100, description="Number of articles to return"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get financial news feed

    - **limit**: Number of articles to return (1-100)
    """
    try:
        data = await fmp_service.get_news_feed(db, current_user.id, limit)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get news feed for user {current_user.id}: {e}")
        # Return empty result for news to prevent widget failure
        return {
            "success": False,
            "data": {"articles": []},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve news feed",
        }


@router.get("/economic/calendar")
async def get_economic_calendar(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    fmp_service: FMPProxyService = Depends(get_fmp_service),
):
    """
    Get economic calendar events

    - **date**: Date in YYYY-MM-DD format (defaults to today)
    """
    try:
        data = await fmp_service.get_economic_calendar(db, current_user.id, date)
        return {
            "success": True,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get economic calendar for user {current_user.id}: {e}")
        # Return empty result for calendar to prevent widget failure
        return {
            "success": False,
            "data": {"events": [], "date": date or datetime.now().strftime("%Y-%m-%d")},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve economic calendar",
        }


# AI Insights Endpoint (Mock for now)
@router.get("/ai/insights")
async def get_ai_insights(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get AI-generated market insights

    Note: This is currently a mock endpoint. In production, this would integrate
    with AI services to provide real market analysis.
    """
    try:
        # Mock AI insights data
        insights = [
            {
                "id": "insight_1",
                "type": "market_trend",
                "title": "Tech Sector Showing Strong Momentum",
                "content": "Technology stocks are outperforming the broader market with strong earnings growth.",
                "sentiment": "bullish",
                "confidence": 0.85,
                "created_at": datetime.utcnow().isoformat(),
                "tags": ["technology", "earnings", "growth"],
            },
            {
                "id": "insight_2",
                "type": "risk_alert",
                "title": "Elevated Market Volatility Expected",
                "content": "VIX levels suggest increased volatility in the coming weeks due to economic uncertainty.",
                "sentiment": "bearish",
                "confidence": 0.72,
                "created_at": datetime.utcnow().isoformat(),
                "tags": ["volatility", "risk", "vix"],
            },
            {
                "id": "insight_3",
                "type": "opportunity",
                "title": "Dividend Stocks Attractive in Current Environment",
                "content": "High-quality dividend stocks offer attractive yields in the current interest rate environment.",
                "sentiment": "neutral",
                "confidence": 0.78,
                "created_at": datetime.utcnow().isoformat(),
                "tags": ["dividends", "income", "rates"],
            },
        ]

        return {
            "success": True,
            "data": {"insights": insights},
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Failed to get AI insights for user {current_user.id}: {e}")
        return {
            "success": False,
            "data": {"insights": []},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve AI insights",
        }


# Recent Transactions Endpoint (Mock for now)
@router.get("/portfolio/transactions")
async def get_recent_transactions(
    limit: int = Query(10, ge=1, le=50, description="Number of transactions to return"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get recent portfolio transactions

    Note: This is currently a mock endpoint. In production, this would fetch
    real transaction data from the user's portfolio.
    """
    try:
        # Mock transaction data
        transactions = [
            {
                "id": "txn_1",
                "type": "buy",
                "symbol": "AAPL",
                "quantity": 10,
                "price": 175.50,
                "total": 1755.00,
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "status": "completed",
            },
            {
                "id": "txn_2",
                "type": "sell",
                "symbol": "GOOGL",
                "quantity": 5,
                "price": 142.30,
                "total": 711.50,
                "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "status": "completed",
            },
            {
                "id": "txn_3",
                "type": "buy",
                "symbol": "MSFT",
                "quantity": 15,
                "price": 378.20,
                "total": 5673.00,
                "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                "status": "completed",
            },
        ]

        return {
            "success": True,
            "data": {"transactions": transactions[:limit]},
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Failed to get transactions for user {current_user.id}: {e}")
        return {
            "success": False,
            "data": {"transactions": []},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve transactions",
        }


# Performance Metrics Endpoint (Mock for now)
@router.get("/portfolio/metrics")
async def get_performance_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get portfolio performance metrics

    Note: This is currently a mock endpoint. In production, this would calculate
    real performance metrics from the user's portfolio.
    """
    try:
        # Mock performance metrics
        metrics = [
            {
                "name": "Total Return",
                "value": "14.32%",
                "change": "+2.1%",
                "trend": "up",
            },
            {"name": "Sharpe Ratio", "value": "1.24", "change": "+0.08", "trend": "up"},
            {
                "name": "Max Drawdown",
                "value": "-8.5%",
                "change": "+1.2%",
                "trend": "up",
            },
            {"name": "Beta", "value": "1.05", "change": "-0.02", "trend": "down"},
            {"name": "Alpha", "value": "2.8%", "change": "+0.5%", "trend": "up"},
        ]

        return {
            "success": True,
            "data": {"metrics": metrics},
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(
            f"Failed to get performance metrics for user {current_user.id}: {e}"
        )
        return {
            "success": False,
            "data": {"metrics": []},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve performance metrics",
        }


# Alerts Endpoint (Mock for now)
@router.get("/alerts")
async def get_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get user alerts and notifications

    Note: This is currently a mock endpoint. In production, this would fetch
    real alerts from the user's alert system.
    """
    try:
        # Mock alerts data
        alerts = [
            {
                "id": "alert_1",
                "type": "price_alert",
                "title": "AAPL Price Target Reached",
                "message": "Apple Inc. has reached your target price of $175.00",
                "severity": "info",
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "symbol": "AAPL",
            },
            {
                "id": "alert_2",
                "type": "portfolio_alert",
                "title": "Portfolio Rebalancing Recommended",
                "message": "Your portfolio allocation has drifted from target. Consider rebalancing.",
                "severity": "warning",
                "status": "active",
                "created_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
            },
            {
                "id": "alert_3",
                "type": "market_alert",
                "title": "High Volatility Detected",
                "message": "Market volatility is elevated. Review your risk exposure.",
                "severity": "high",
                "status": "active",
                "created_at": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
            },
        ]

        return {
            "success": True,
            "data": {"alerts": alerts},
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Failed to get alerts for user {current_user.id}: {e}")
        return {
            "success": False,
            "data": {"alerts": []},
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Failed to retrieve alerts",
        }
