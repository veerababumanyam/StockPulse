"""
Market Research Agent API endpoints
Handles communication between frontend and A2A Market Research Agent
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import structlog

from ...core.config import settings
from ...core.dependencies import get_current_user
from ...models.user import User
from ...services.auth.permission_service import PermissionService

logger = structlog.get_logger(__name__)

# Router setup
router = APIRouter(prefix="/agents", tags=["Market Research Agent"])

# Configuration
MARKET_RESEARCH_AGENT_URL = settings.MARKET_RESEARCH_AGENT_URL or "http://localhost:9003"
A2A_TIMEOUT = 30.0

# Request/Response Models
class GenerateInsightsRequest(BaseModel):
    user_id: str
    count: Optional[int] = Field(default=5, ge=1, le=20)
    context: Optional[Dict[str, Any]] = None

class NLQRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    user_id: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

class A2AMessage(BaseModel):
    jsonrpc: str = "2.0"
    id: str = Field(default_factory=lambda: str(uuid4()))
    method: str
    params: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source_agent: str = "stockpulse-backend"
    target_agent: str = "market-researcher"

class MarketInsight(BaseModel):
    id: str
    title: str
    content: str
    summary: Optional[str] = None
    insight_type: str
    priority: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    sentiment: Optional[str] = None
    reference_symbol: Optional[str] = None
    source: str
    tags: List[str] = Field(default_factory=list)
    agent_id: str
    timestamp: datetime
    actionable: bool
    ag_ui_components: Optional[List[Dict[str, Any]]] = None

# A2A Communication Helper
class MarketResearchAgentClient:
    """Client for communicating with Market Research Agent via A2A protocol."""
    
    def __init__(self):
        self.base_url = MARKET_RESEARCH_AGENT_URL
        self.timeout = A2A_TIMEOUT
    
    async def call_agent(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make A2A call to Market Research Agent."""
        message = A2AMessage(
            method=method,
            params=params
        )
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/jsonrpc",
                    json=message.dict(),
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "StockPulse-Backend/1.0.0"
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Market Research Agent unavailable: {response.status_code}"
                    )
                
                result = response.json()
                
                if "error" in result:
                    error = result["error"]
                    raise HTTPException(
                        status_code=400,
                        detail=f"Agent Error: {error.get('message', 'Unknown error')}"
                    )
                
                return result.get("result", {})
                
            except httpx.TimeoutException:
                logger.error(f"Timeout calling agent method: {method}")
                raise HTTPException(
                    status_code=504,
                    detail="Market Research Agent timeout"
                )
            except httpx.RequestError as e:
                logger.error(f"Request error calling agent method {method}: {e}")
                raise HTTPException(
                    status_code=502,
                    detail="Unable to reach Market Research Agent"
                )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check agent health."""
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(f"{self.base_url}/health")
                return response.json()
            except Exception as e:
                logger.error(f"Health check failed: {e}")
                return {"status": "unhealthy", "error": str(e)}

# Global agent client
agent_client = MarketResearchAgentClient()

# API Endpoints
@router.get("/market-insights/health")
async def check_agent_health():
    """Check Market Research Agent health."""
    health_status = await agent_client.health_check()
    return {
        "success": True,
        "data": health_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/market-insights/generate")
async def generate_insights(
    request: GenerateInsightsRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Generate proactive market insights."""
    try:
        # Verify user permissions
        if not await PermissionService.verify_user_permission(
            current_user.id, "market_insights:read"
        ):
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions for market insights"
            )
        
        # Call Market Research Agent
        result = await agent_client.call_agent(
            "generate_insights",
            {
                "user_id": str(current_user.id),
                "count": request.count,
                "context": request.context or {}
            }
        )
        
        # Transform insights to match frontend expectations
        insights = []
        for insight_data in result:
            try:
                insight = MarketInsight(
                    id=insight_data.get("id", str(uuid4())),
                    title=insight_data.get("title", "Market Insight"),
                    content=insight_data.get("content", ""),
                    summary=insight_data.get("summary"),
                    insight_type=insight_data.get("insight_type", "analysis"),
                    priority=insight_data.get("priority", "MEDIUM"),
                    confidence=insight_data.get("confidence", 0.8),
                    sentiment=insight_data.get("sentiment"),
                    reference_symbol=insight_data.get("reference_symbol"),
                    source=insight_data.get("source", "Market Research Agent"),
                    tags=insight_data.get("tags", []),
                    agent_id=insight_data.get("agent_id", "market-researcher"),
                    timestamp=datetime.fromisoformat(
                        insight_data.get("timestamp", datetime.utcnow().isoformat())
                    ),
                    actionable=insight_data.get("actionable", False),
                    ag_ui_components=insight_data.get("ag_ui_components")
                )
                insights.append(insight.dict())
            except Exception as e:
                logger.warning(f"Error parsing insight: {e}")
                continue
        
        # Log usage for analytics
        background_tasks.add_task(
            log_market_insights_usage,
            user_id=current_user.id,
            insight_count=len(insights),
            method="generate"
        )
        
        return {
            "success": True,
            "data": {"insights": insights},
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate market insights"
        )

@router.post("/market-insights/nlq")
async def process_natural_language_query(
    request: NLQRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Process natural language query about financial markets."""
    try:
        # Verify user permissions
        if not await PermissionService.verify_user_permission(
            current_user.id, "market_insights:query"
        ):
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions for market queries"
            )
        
        # Rate limiting check (server-side backup)
        if not await check_nlq_rate_limit(current_user.id):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please wait before making another query."
            )
        
        # Call Market Research Agent
        result = await agent_client.call_agent(
            "natural_language_query",
            {
                "query": request.query,
                "user_id": str(current_user.id),
                "context": request.context or {},
                "session_id": request.session_id
            }
        )
        
        # Log usage for analytics
        background_tasks.add_task(
            log_market_insights_usage,
            user_id=current_user.id,
            query=request.query,
            method="nlq"
        )
        
        return {
            "success": True,
            "data": {
                "answer": result.get("answer", ""),
                "sources": result.get("sources", []),
                "confidence": result.get("confidence", 0.8),
                "ag_ui_components": result.get("ag_ui_components"),
                "follow_up_questions": result.get("follow_up_questions", [])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing NLQ: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process natural language query"
        )

@router.get("/market-insights/agent-card")
async def get_agent_card():
    """Get Market Research Agent capabilities and information."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{MARKET_RESEARCH_AGENT_URL}/.well-known/agent.json")
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json(),
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                raise HTTPException(
                    status_code=502,
                    detail="Unable to fetch agent card"
                )
    except Exception as e:
        logger.error(f"Error fetching agent card: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch agent information"
        )

# Advanced A2A endpoints for direct communication
@router.post("/market-insights/analyze/{analysis_type}")
async def run_specific_analysis(
    analysis_type: str,
    params: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Run specific analysis types (market_analysis, news_research, etc.)."""
    try:
        # Verify permissions
        if not await PermissionService.verify_user_permission(
            current_user.id, "market_insights:analyze"
        ):
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions for market analysis"
            )
        
        # Map analysis types to agent methods
        method_map = {
            "market": "market_analysis",
            "news": "news_research", 
            "company": "company_analysis",
            "trends": "trend_identification",
            "sector": "sector_analysis",
            "sentiment": "sentiment_analysis"
        }
        
        if analysis_type not in method_map:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid analysis type: {analysis_type}"
            )
        
        method = method_map[analysis_type]
        result = await agent_client.call_agent(method, params)
        
        return {
            "success": True,
            "data": result,
            "analysis_type": analysis_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running {analysis_type} analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run {analysis_type} analysis"
        )

# Helper functions
async def check_nlq_rate_limit(user_id: str) -> bool:
    """Check NLQ rate limit for user (5 requests per minute)."""
    # In production, use Redis or database to track rate limits
    # For now, this is a placeholder that always returns True
    return True

async def log_market_insights_usage(
    user_id: str,
    method: str,
    insight_count: Optional[int] = None,
    query: Optional[str] = None
):
    """Log market insights usage for analytics."""
    usage_data = {
        "user_id": user_id,
        "method": method,
        "timestamp": datetime.utcnow().isoformat(),
        "insight_count": insight_count,
        "query_length": len(query) if query else None
    }
    
    logger.info("Market insights usage", **usage_data) 