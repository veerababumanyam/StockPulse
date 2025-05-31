"""
Data Orchestration API Endpoints
Provides access to the comprehensive data architecture with intelligent caching and analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ...core.database import get_db
from ...core.dependencies import get_current_user, CurrentUser
from ...core.events import get_event_bus, EventBus
from ...services.data_orchestrator import DataOrchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["Data Orchestration"])

# Dependency to get data orchestrator
async def get_data_orchestrator(event_bus: EventBus = Depends(get_event_bus)) -> DataOrchestrator:
    orchestrator = DataOrchestrator(event_bus)
    await orchestrator.initialize()
    return orchestrator

# Market Data Endpoints
@router.get("/market/{symbol}")
async def get_market_data(
    symbol: str,
    data_type: str = Query("quote", description="Type of market data (quote, chart, news, fundamentals)"),
    force_refresh: bool = Query(False, description="Force refresh from external API"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Get market data with intelligent caching and fallback
    
    - **symbol**: Stock symbol (e.g., AAPL, GOOGL)
    - **data_type**: Type of data (quote, chart, news, fundamentals)
    - **force_refresh**: Force refresh from external API
    """
    try:
        data = await orchestrator.get_market_data(
            db, current_user.id, symbol.upper(), data_type, force_refresh
        )
        
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Market data not found for {symbol}"
            )
        
        return {
            "success": True,
            "data": data,
            "symbol": symbol.upper(),
            "data_type": data_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get market data for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve market data"
        )

@router.post("/market/{symbol}")
async def store_market_data(
    symbol: str,
    data_type: str,
    data: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Store market data across all data layers
    
    - **symbol**: Stock symbol
    - **data_type**: Type of data
    - **data**: Market data payload
    - **metadata**: Additional metadata
    """
    try:
        success = await orchestrator.store_market_data(
            db, symbol.upper(), data_type, data, metadata
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store market data"
            )
        
        return {
            "success": True,
            "message": f"Market data stored successfully for {symbol}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to store market data for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store market data"
        )

# Portfolio Data Endpoints
@router.get("/portfolio/data")
async def get_portfolio_data(
    data_type: str = Query("overview", description="Type of portfolio data"),
    force_refresh: bool = Query(False, description="Force refresh from database"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Get portfolio data with intelligent caching
    
    - **data_type**: Type of portfolio data (overview, performance, holdings)
    - **force_refresh**: Force refresh from database
    """
    try:
        data = await orchestrator.get_portfolio_data(
            db, current_user.id, data_type, force_refresh
        )
        
        return {
            "success": True,
            "data": data,
            "data_type": data_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get portfolio data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio data"
        )

@router.post("/portfolio/snapshot")
async def create_portfolio_snapshot(
    portfolio_data: Dict[str, Any],
    holdings: List[Dict[str, Any]],
    performance_metrics: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Create portfolio snapshot across all data layers
    
    - **portfolio_data**: Portfolio overview data
    - **holdings**: List of portfolio holdings
    - **performance_metrics**: Performance metrics
    """
    try:
        success = await orchestrator.store_portfolio_snapshot(
            db, current_user.id, portfolio_data, holdings, performance_metrics
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create portfolio snapshot"
            )
        
        return {
            "success": True,
            "message": "Portfolio snapshot created successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create portfolio snapshot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portfolio snapshot"
        )

# Content and News Endpoints
@router.post("/news/article")
async def store_news_article(
    article_id: str,
    title: str,
    content: str,
    symbols: List[str],
    sentiment: float,
    metadata: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Store news article across vector storage and knowledge graph
    
    - **article_id**: Unique article identifier
    - **title**: Article title
    - **content**: Article content
    - **symbols**: Related stock symbols
    - **sentiment**: Sentiment score (-1 to 1)
    - **metadata**: Additional metadata
    """
    try:
        success = await orchestrator.store_news_article(
            db, article_id, title, content, symbols, sentiment, metadata
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store news article"
            )
        
        return {
            "success": True,
            "message": "News article stored successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to store news article: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store news article"
        )

@router.get("/content/search")
async def search_related_content(
    query: str = Query(..., description="Search query"),
    content_types: List[str] = Query(["news", "insights"], description="Types of content to search"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Search for related content across vector storage
    
    - **query**: Search query
    - **content_types**: Types of content to search (news, insights, research)
    - **limit**: Number of results to return
    """
    try:
        results = await orchestrator.search_related_content(
            query, content_types, current_user.id, limit
        )
        
        return {
            "success": True,
            "data": {
                "query": query,
                "results": results,
                "total_results": len(results)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to search related content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search related content"
        )

# AI Insights Endpoints
@router.post("/insights/ai")
async def store_ai_insight(
    insight_id: str,
    title: str,
    content: str,
    insight_type: str,
    confidence: float,
    symbols: List[str],
    metadata: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Store AI insight across all appropriate data layers
    
    - **insight_id**: Unique insight identifier
    - **title**: Insight title
    - **content**: Insight content
    - **insight_type**: Type of insight (market_trend, risk_alert, opportunity)
    - **confidence**: Confidence score (0 to 1)
    - **symbols**: Related stock symbols
    - **metadata**: Additional metadata
    """
    try:
        success = await orchestrator.store_ai_insight(
            db, insight_id, title, content, insight_type, confidence, symbols, metadata
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store AI insight"
            )
        
        return {
            "success": True,
            "message": "AI insight stored successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to store AI insight: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store AI insight"
        )

@router.get("/insights/market")
async def get_market_insights(
    symbols: Optional[List[str]] = Query(None, description="Stock symbols to analyze"),
    insight_types: Optional[List[str]] = Query(None, description="Types of insights to retrieve"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Get comprehensive market insights from all data sources
    
    - **symbols**: Stock symbols to analyze
    - **insight_types**: Types of insights to retrieve
    """
    try:
        insights = await orchestrator.get_market_insights(
            db, current_user.id, symbols, insight_types
        )
        
        return {
            "success": True,
            "data": {
                "insights": insights,
                "total_insights": len(insights),
                "symbols": symbols,
                "insight_types": insight_types
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get market insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve market insights"
        )

# Analytics Endpoints
@router.get("/analytics/portfolio/risk")
async def analyze_portfolio_risk(
    portfolio_id: str = Query(..., description="Portfolio ID to analyze"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Comprehensive portfolio risk analysis using all data layers
    
    - **portfolio_id**: Portfolio ID to analyze
    """
    try:
        risk_analysis = await orchestrator.analyze_portfolio_risk(
            db, current_user.id, portfolio_id
        )
        
        if not risk_analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found or insufficient data for analysis"
            )
        
        return {
            "success": True,
            "data": risk_analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze portfolio risk: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze portfolio risk"
        )

# System Health and Maintenance Endpoints
@router.get("/health")
async def get_data_health_metrics(
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Get health metrics for all data layers
    """
    try:
        health_metrics = await orchestrator.get_data_health_metrics()
        
        return {
            "success": True,
            "data": health_metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get data health metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve data health metrics"
        )

@router.post("/maintenance/optimize")
async def optimize_data_layers(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    orchestrator: DataOrchestrator = Depends(get_data_orchestrator)
):
    """
    Optimize all data layers for performance (background task)
    """
    try:
        # Run optimization in background
        background_tasks.add_task(orchestrator.optimize_data_layers, db)
        
        return {
            "success": True,
            "message": "Data layer optimization started in background",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to start data optimization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start data optimization"
        ) 