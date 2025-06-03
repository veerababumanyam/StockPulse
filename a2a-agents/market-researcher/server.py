#!/usr/bin/env python3
"""
Market Research Agent - A2A Compliant Financial Intelligence Agent
Implements Google A2A specification with MCP integration for StockPulse
"""

import asyncio
import json
import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import structlog
import httpx
from contextlib import asynccontextmanager

# Add parent directory to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import shared utilities
from shared.a2a_protocol import A2AMessage, A2AResponse, A2AError, JSONRPCHandler
from shared.mcp_client import MCPClient
from shared.rag_engine import LightRAGEngine
from shared.security import authenticate_request, RateLimiter

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Configuration
AGENT_ID = "market-researcher"
AGENT_NAME = "Market Research Agent"
AGENT_PORT = int(os.getenv("AGENT_PORT", "9003"))
AGENT_VERSION = "1.0.0"

# MCP Server endpoints - Updated to match actual Docker container ports
MCP_GRAPHITI_URL = os.getenv("MCP_GRAPHITI_URL", "http://localhost:8006")
MCP_QDRANT_URL = os.getenv("MCP_QDRANT_URL", "http://localhost:8007")
MCP_TIMESCALE_URL = os.getenv("MCP_TIMESCALE_URL", "http://localhost:8004")

# External APIs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# WebSocket connections for real-time updates
active_connections: Dict[str, WebSocket] = {}

# Pydantic Models
class MarketInsight(BaseModel):
    """Market insight data model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    content: str
    summary: Optional[str] = None
    insight_type: str = Field(..., description="Type of insight")
    priority: str = Field(..., description="Priority level")
    confidence: float = Field(..., ge=0.0, le=1.0)
    sentiment: Optional[str] = None
    reference_symbol: Optional[str] = None
    source: str
    tags: List[str] = Field(default_factory=list)
    agent_id: str = Field(default=AGENT_ID)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actionable: bool = False
    ag_ui_components: Optional[List[Dict[str, Any]]] = None

class NLQRequest(BaseModel):
    """Natural Language Query request model."""
    query: str = Field(..., min_length=1, max_length=1000)
    user_id: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

class NLQResponse(BaseModel):
    """Natural Language Query response model."""
    answer: str
    sources: List[Dict[str, str]] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0)
    ag_ui_components: Optional[List[Dict[str, Any]]] = None
    follow_up_questions: List[str] = Field(default_factory=list)

class AgentCard(BaseModel):
    """A2A Agent Card specification."""
    agent_id: str = AGENT_ID
    name: str = AGENT_NAME
    version: str = AGENT_VERSION
    description: str = "Market analysis, news research, and trend identification"
    capabilities: List[str] = Field(default_factory=lambda: [
        "market_analysis", "news_research", "company_analysis", 
        "trend_identification", "sector_analysis", "sentiment_analysis"
    ])
    endpoints: Dict[str, str] = Field(default_factory=lambda: {
        "jsonrpc": "/jsonrpc",
        "websocket": "/ws",
        "health": "/health"
    })
    protocols: List[str] = Field(default_factory=lambda: ["A2A", "MCP", "WebSocket"])

class MarketResearchAgent:
    """Main Market Research Agent implementation."""
    
    def __init__(self):
        self.mcp_graphiti = MCPClient(MCP_GRAPHITI_URL)
        self.mcp_qdrant = MCPClient(MCP_QDRANT_URL)
        self.mcp_timescale = MCPClient(MCP_TIMESCALE_URL)
        self.rag_engine = LightRAGEngine(
            openai_api_key=OPENAI_API_KEY,
            anthropic_api_key=ANTHROPIC_API_KEY
        )
        self.rate_limiter = RateLimiter()
        self.jsonrpc_handler = JSONRPCHandler()
        
        # Register A2A skills
        self._register_skills()
    
    def _register_skills(self):
        """Register available A2A skills."""
        self.jsonrpc_handler.register("market_analysis", self.market_analysis)
        self.jsonrpc_handler.register("news_research", self.news_research)
        self.jsonrpc_handler.register("company_analysis", self.company_analysis)
        self.jsonrpc_handler.register("trend_identification", self.trend_identification)
        self.jsonrpc_handler.register("sector_analysis", self.sector_analysis)
        self.jsonrpc_handler.register("sentiment_analysis", self.sentiment_analysis)
        self.jsonrpc_handler.register("generate_insights", self.generate_insights)
        self.jsonrpc_handler.register("natural_language_query", self.natural_language_query)
    
    async def initialize(self):
        """Initialize agent connections and resources."""
        try:
            # Initialize MCP connections
            await self.mcp_graphiti.connect()
            await self.mcp_qdrant.connect()
            await self.mcp_timescale.connect()
            
            # Initialize RAG engine
            await self.rag_engine.initialize()
            
            logger.info("Market Research Agent initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")
            raise
    
    async def shutdown(self):
        """Gracefully shutdown agent connections."""
        try:
            await self.mcp_graphiti.disconnect()
            await self.mcp_qdrant.disconnect()
            await self.mcp_timescale.disconnect()
            await self.rag_engine.shutdown()
            
            logger.info("Market Research Agent shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

    # A2A Skills Implementation
    async def market_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive market condition analysis."""
        try:
            symbols = params.get("symbols", [])
            timeframe = params.get("timeframe", "1D")
            
            # Get market data from TimescaleDB via MCP
            market_data = await self.mcp_timescale.call_tool(
                "get_market_data", {"symbols": symbols, "timeframe": timeframe}
            )
            
            # Get news sentiment from Graphiti
            news_sentiment = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": f"Recent market sentiment for {', '.join(symbols)}",
                    "knowledge_group": "financial_news"
                }
            )
            
            # Generate analysis using RAG
            analysis = await self.rag_engine.analyze_market_conditions(
                market_data, news_sentiment, symbols
            )
            
            return {
                "analysis": analysis,
                "confidence": 0.85,
                "timestamp": datetime.utcnow().isoformat(),
                "symbols_analyzed": symbols,
                "timeframe": timeframe
            }
            
        except Exception as e:
            logger.error(f"Market analysis error: {e}")
            raise A2AError("ANALYSIS_FAILED", str(e))
    
    async def news_research(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Research and analyze financial news."""
        try:
            keywords = params.get("keywords", [])
            time_range = params.get("time_range", "24h")
            
            # Query Graphiti for relevant news
            news_data = await self.mcp_graphiti.call_tool(
                "search_by_time_range", {
                    "knowledge_group": "financial_news",
                    "keywords": keywords,
                    "time_range": time_range
                }
            )
            
            # Perform semantic search in Qdrant
            semantic_results = await self.mcp_qdrant.call_tool(
                "semantic_search", {
                    "collection": "financial_news",
                    "query": " ".join(keywords),
                    "limit": 20
                }
            )
            
            # Generate research summary using RAG
            research_summary = await self.rag_engine.research_news(
                news_data, semantic_results, keywords
            )
            
            return {
                "research_summary": research_summary,
                "news_count": len(news_data.get("results", [])),
                "semantic_matches": len(semantic_results.get("results", [])),
                "confidence": 0.88,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"News research error: {e}")
            raise A2AError("RESEARCH_FAILED", str(e))
    
    async def company_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Deep-dive company analysis."""
        try:
            symbol = params.get("symbol")
            analysis_depth = params.get("depth", "standard")
            
            if not symbol:
                raise A2AError("INVALID_PARAMS", "Symbol is required")
            
            # Get company filings from Graphiti
            filings_data = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": f"Company filings and documents for {symbol}",
                    "knowledge_group": "company_filings"
                }
            )
            
            # Get financial metrics from TimescaleDB
            financial_data = await self.mcp_timescale.call_tool(
                "get_financial_metrics", {"symbol": symbol}
            )
            
            # Generate comprehensive analysis
            company_analysis = await self.rag_engine.analyze_company(
                symbol, filings_data, financial_data, analysis_depth
            )
            
            return {
                "company_analysis": company_analysis,
                "symbol": symbol,
                "analysis_depth": analysis_depth,
                "confidence": 0.92,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Company analysis error: {e}")
            raise A2AError("ANALYSIS_FAILED", str(e))
    
    async def trend_identification(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Identify market trends and patterns."""
        try:
            timeframe = params.get("timeframe", "1M")
            sectors = params.get("sectors", [])
            
            # Get historical data for trend analysis
            trend_data = await self.mcp_timescale.call_tool(
                "get_trend_data", {
                    "timeframe": timeframe,
                    "sectors": sectors
                }
            )
            
            # Get market analysis insights from Graphiti
            market_insights = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": "Market trends and patterns",
                    "knowledge_group": "market_analysis"
                }
            )
            
            # Identify trends using RAG
            trend_analysis = await self.rag_engine.identify_trends(
                trend_data, market_insights, timeframe, sectors
            )
            
            return {
                "trend_analysis": trend_analysis,
                "timeframe": timeframe,
                "sectors_analyzed": sectors,
                "confidence": 0.83,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Trend identification error: {e}")
            raise A2AError("ANALYSIS_FAILED", str(e))
    
    async def sector_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze specific market sectors."""
        try:
            sector = params.get("sector")
            comparison_sectors = params.get("comparison_sectors", [])
            
            if not sector:
                raise A2AError("INVALID_PARAMS", "Sector is required")
            
            # Get sector data from multiple sources
            sector_data = await self.mcp_timescale.call_tool(
                "get_sector_data", {"sector": sector, "comparison_sectors": comparison_sectors}
            )
            
            # Get sector news and sentiment
            sector_sentiment = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": f"Sector analysis and news for {sector}",
                    "knowledge_group": "financial_news"
                }
            )
            
            # Generate sector analysis
            analysis = await self.rag_engine.analyze_sector(
                sector, sector_data, sector_sentiment, comparison_sectors
            )
            
            return {
                "sector_analysis": analysis,
                "sector": sector,
                "comparison_sectors": comparison_sectors,
                "confidence": 0.87,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Sector analysis error: {e}")
            raise A2AError("ANALYSIS_FAILED", str(e))
    
    async def sentiment_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze market sentiment across multiple sources."""
        try:
            symbols = params.get("symbols", [])
            sentiment_sources = params.get("sources", ["news", "social", "reports"])
            
            # Get sentiment data from Graphiti
            sentiment_data = await self.mcp_graphiti.call_tool(
                "analyze_sentiment", {
                    "symbols": symbols,
                    "sources": sentiment_sources,
                    "knowledge_group": "financial_news"
                }
            )
            
            # Get social sentiment from Qdrant
            social_sentiment = await self.mcp_qdrant.call_tool(
                "sentiment_search", {
                    "collection": "social_sentiment",
                    "symbols": symbols
                }
            )
            
            # Generate comprehensive sentiment analysis
            sentiment_analysis = await self.rag_engine.analyze_sentiment(
                symbols, sentiment_data, social_sentiment, sentiment_sources
            )
            
            return {
                "sentiment_analysis": sentiment_analysis,
                "symbols": symbols,
                "sources_analyzed": sentiment_sources,
                "confidence": 0.84,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            raise A2AError("ANALYSIS_FAILED", str(e))
    
    async def generate_insights(self, params: Dict[str, Any]) -> List[MarketInsight]:
        """Generate proactive market insights."""
        try:
            user_id = params.get("user_id")
            insight_count = params.get("count", 5)
            
            # Get user preferences from Graphiti
            user_preferences = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": f"User preferences and trading patterns for {user_id}",
                    "knowledge_group": "user_interactions"
                }
            )
            
            # Get latest market data
            market_data = await self.mcp_timescale.call_tool(
                "get_latest_market_data", {"limit": 100}
            )
            
            # Get news and research reports
            latest_news = await self.mcp_graphiti.call_tool(
                "get_latest_knowledge", {
                    "knowledge_group": "financial_news",
                    "limit": 50
                }
            )
            
            # Generate insights using RAG
            insights = await self.rag_engine.generate_insights(
                user_preferences, market_data, latest_news, insight_count
            )
            
            # Convert to MarketInsight objects
            market_insights = []
            for insight in insights:
                market_insight = MarketInsight(
                    title=insight.get("title", "Market Insight"),
                    content=insight.get("content", ""),
                    summary=insight.get("summary"),
                    insight_type=insight.get("type", "analysis"),
                    priority=insight.get("priority", "MEDIUM"),
                    confidence=insight.get("confidence", 0.8),
                    sentiment=insight.get("sentiment"),
                    reference_symbol=insight.get("symbol"),
                    source="Market Research Agent",
                    tags=insight.get("tags", []),
                    actionable=insight.get("actionable", False),
                    ag_ui_components=insight.get("ag_ui_components")
                )
                market_insights.append(market_insight)
            
            # Push insights to connected clients via WebSocket
            await self._broadcast_insights(market_insights)
            
            return [insight.dict() for insight in market_insights]
            
        except Exception as e:
            logger.error(f"Insight generation error: {e}")
            raise A2AError("INSIGHT_GENERATION_FAILED", str(e))
    
    async def natural_language_query(self, params: Dict[str, Any]) -> NLQResponse:
        """Handle natural language queries about financial markets."""
        try:
            query = params.get("query", "").strip()
            user_id = params.get("user_id")
            context = params.get("context", {})
            
            if not query:
                raise A2AError("INVALID_QUERY", "Query cannot be empty")
            
            # Rate limiting check
            if not await self.rate_limiter.check_rate_limit(f"nlq:{user_id}", 5, 60):
                raise A2AError("RATE_LIMITED", "Too many queries. Please wait.")
            
            # Get relevant context from knowledge graphs
            context_data = await self._get_query_context(query, user_id)
            
            # Generate response using RAG
            rag_response = await self.rag_engine.process_nlq(
                query, context_data, context
            )
            
            response = NLQResponse(
                answer=rag_response.get("answer", ""),
                sources=rag_response.get("sources", []),
                confidence=rag_response.get("confidence", 0.8),
                ag_ui_components=rag_response.get("ag_ui_components"),
                follow_up_questions=rag_response.get("follow_up_questions", [])
            )
            
            return response.dict()
            
        except Exception as e:
            logger.error(f"NLQ processing error: {e}")
            raise A2AError("NLQ_FAILED", str(e))
    
    async def _get_query_context(self, query: str, user_id: str) -> Dict[str, Any]:
        """Get relevant context for a natural language query."""
        try:
            # Semantic search for relevant information
            semantic_results = await self.mcp_qdrant.call_tool(
                "semantic_search", {
                    "collection": "financial_knowledge",
                    "query": query,
                    "limit": 10
                }
            )
            
            # Get user context from Graphiti
            user_context = await self.mcp_graphiti.call_tool(
                "query_knowledge_graph", {
                    "query": f"User context and preferences for {user_id}",
                    "knowledge_group": "user_interactions"
                }
            )
            
            # Get relevant market data
            market_context = await self.mcp_timescale.call_tool(
                "get_relevant_market_data", {"query": query}
            )
            
            return {
                "semantic_results": semantic_results,
                "user_context": user_context,
                "market_context": market_context
            }
            
        except Exception as e:
            logger.error(f"Error getting query context: {e}")
            return {}
    
    async def _broadcast_insights(self, insights: List[MarketInsight]):
        """Broadcast insights to connected WebSocket clients."""
        if not active_connections:
            return
        
        message = {
            "type": "insights_update",
            "data": [insight.dict() for insight in insights],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        disconnected = []
        for client_id, websocket in active_connections.items():
            try:
                await websocket.send_json(message)
            except:
                disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            active_connections.pop(client_id, None)

# Initialize agent
agent = MarketResearchAgent()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan management for graceful startup and shutdown."""
    try:
        # Startup
        logger.info("Starting Market Research Agent...")
        await agent.initialize()
        logger.info("Market Research Agent initialized successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        # Continue with limited functionality
        yield
    finally:
        # Shutdown
        logger.info("Shutting down Market Research Agent...")
        try:
            await agent.shutdown()
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
        logger.info("Market Research Agent shutdown completed")

# FastAPI application
app = FastAPI(
    title="Market Research Agent",
    description="A2A compliant financial intelligence agent for StockPulse",
    version=AGENT_VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/.well-known/agent.json")
async def get_agent_card():
    """Return A2A Agent Card specification."""
    return AgentCard().dict()

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "agent_id": AGENT_ID,
        "agent_name": AGENT_NAME,
        "version": AGENT_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/jsonrpc")
async def jsonrpc_endpoint(request: Dict[str, Any]):
    """A2A JSON-RPC endpoint."""
    try:
        response = await agent.jsonrpc_handler.handle_request(request)
        return response
    except Exception as e:
        logger.error(f"JSON-RPC error: {e}")
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": -32603,
                "message": "Internal error",
                "data": str(e)
            },
            "id": request.get("id")
        }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await websocket.accept()
    client_id = str(uuid4())
    active_connections[client_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif message.get("type") == "subscribe":
                # Handle subscription logic
                await websocket.send_json({
                    "type": "subscribed",
                    "client_id": client_id
                })
    
    except WebSocketDisconnect:
        active_connections.pop(client_id, None)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        active_connections.pop(client_id, None)

# API Routes
@app.post("/api/insights/generate")
async def generate_insights_api(
    user_id: str,
    count: int = 5,
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Generate market insights API endpoint."""
    try:
        insights = await agent.generate_insights({
            "user_id": user_id,
            "count": count
        })
        
        return {
            "success": True,
            "data": {"insights": insights},
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"API insight generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/nlq")
async def natural_language_query_api(request: NLQRequest):
    """Natural language query API endpoint."""
    try:
        response = await agent.natural_language_query(request.dict())
        
        return {
            "success": True,
            "data": response,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except A2AError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        logger.error(f"API NLQ error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=AGENT_PORT,
        reload=False,
        log_level="info"
    ) 