"""
Knowledge Graph API endpoints using Graphiti for RAG capabilities.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ...services.knowledge_graph import (
    GraphitiError,
    StockPulseKnowledgeGraph,
    get_knowledge_graph,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


# Request/Response Models
class FinancialNewsRequest(BaseModel):
    """Request model for adding financial news."""

    title: str
    content: str
    source: str
    symbols: List[str]
    published_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class CompanyFilingRequest(BaseModel):
    """Request model for adding company filings."""

    symbol: str
    filing_type: str
    content: str
    filing_date: datetime
    metadata: Optional[Dict[str, Any]] = None


class UserInteractionRequest(BaseModel):
    """Request model for adding user interactions."""

    user_id: str
    action: str
    context: Dict[str, Any]
    timestamp: datetime


class KnowledgeSearchRequest(BaseModel):
    """Request model for knowledge search."""

    query: str
    group_id: Optional[str] = None
    limit: int = 10


class RelatedEntitiesRequest(BaseModel):
    """Request model for finding related entities."""

    entity_name: str
    entity_type: Optional[str] = None
    max_distance: int = 2


class EpisodeResponse(BaseModel):
    """Response model for episode creation."""

    episode_id: str
    message: str


class SearchResult(BaseModel):
    """Search result model."""

    content: str
    score: float
    metadata: Dict[str, Any]
    episode_id: Optional[str]
    group_id: Optional[str]


class SearchResponse(BaseModel):
    """Search response model."""

    results: List[SearchResult]
    total_results: int
    query: str


# API Endpoints
@router.post("/news", response_model=EpisodeResponse)
async def add_financial_news(
    request: FinancialNewsRequest,
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Add financial news to the knowledge graph.

    This endpoint ingests financial news articles and creates semantic relationships
    with companies, markets, and other relevant entities.
    """
    try:
        episode_id = await kg.add_financial_news(
            title=request.title,
            content=request.content,
            source=request.source,
            symbols=request.symbols,
            published_at=request.published_at,
            metadata=request.metadata,
        )

        return EpisodeResponse(
            episode_id=episode_id,
            message=f"Successfully added financial news from {request.source}",
        )

    except GraphitiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge graph error: {str(e)}",
        )


@router.post("/filings", response_model=EpisodeResponse)
async def add_company_filing(
    request: CompanyFilingRequest,
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Add company SEC filing to the knowledge graph.

    This endpoint processes regulatory filings and creates relationships
    with the company and relevant market entities.
    """
    try:
        episode_id = await kg.add_company_filing(
            symbol=request.symbol,
            filing_type=request.filing_type,
            content=request.content,
            filing_date=request.filing_date,
            metadata=request.metadata,
        )

        return EpisodeResponse(
            episode_id=episode_id,
            message=f"Successfully added {request.filing_type} filing for {request.symbol}",
        )

    except GraphitiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge graph error: {str(e)}",
        )


@router.post("/interactions", response_model=EpisodeResponse)
async def add_user_interaction(
    request: UserInteractionRequest,
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Add user interaction to build personalized knowledge.

    This endpoint tracks user behavior to create personalized
    investment insights and recommendations.
    """
    try:
        episode_id = await kg.add_user_interaction(
            user_id=request.user_id,
            action=request.action,
            context=request.context,
            timestamp=request.timestamp,
        )

        return EpisodeResponse(
            episode_id=episode_id,
            message=f"Successfully recorded user interaction: {request.action}",
        )

    except GraphitiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge graph error: {str(e)}",
        )


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(
    request: KnowledgeSearchRequest,
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Search the knowledge graph using hybrid semantic search.

    This endpoint provides intelligent search across all financial knowledge
    using semantic understanding, keyword matching, and graph relationships.
    """
    try:
        results = await kg.search_knowledge(
            query=request.query, group_id=request.group_id, limit=request.limit
        )

        search_results = [
            SearchResult(
                content=result["content"],
                score=result["score"],
                metadata=result["metadata"],
                episode_id=result["episode_id"],
                group_id=result["group_id"],
            )
            for result in results
        ]

        return SearchResponse(
            results=search_results,
            total_results=len(search_results),
            query=request.query,
        )

    except GraphitiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge search error: {str(e)}",
        )


@router.post("/related")
async def get_related_entities(
    request: RelatedEntitiesRequest,
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Find entities related to a given entity through the knowledge graph.

    This endpoint discovers relationships between companies, markets, events,
    and other financial entities to provide contextual intelligence.
    """
    try:
        related_entities = await kg.get_related_entities(
            entity_name=request.entity_name,
            entity_type=request.entity_type,
            max_distance=request.max_distance,
        )

        return {
            "entity": request.entity_name,
            "related_entities": related_entities,
            "max_distance": request.max_distance,
        }

    except GraphitiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Related entities error: {str(e)}",
        )


@router.get("/health")
async def knowledge_graph_health(
    kg: StockPulseKnowledgeGraph = Depends(get_knowledge_graph),
):
    """
    Check the health of the knowledge graph service.

    This endpoint provides status information about the Graphiti
    knowledge graph and Neo4j backend connection.
    """
    try:
        health_status = await kg.health_check()

        if health_status["healthy"]:
            return health_status
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=health_status
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(e)}",
        )


@router.get("/groups")
async def get_knowledge_groups():
    """
    Get available knowledge groups.

    Returns the list of knowledge groups available in the system
    for organizing different types of financial information.
    """
    from ...core.config import get_settings

    settings = get_settings()

    return {
        "groups": settings.GRAPHITI_GROUPS,
        "descriptions": {
            "financial_news": "Real-time financial news and market updates",
            "company_filings": "SEC filings and regulatory documents",
            "market_analysis": "Technical indicators and market correlations",
            "user_interactions": "User behavior and preference patterns",
            "research_reports": "Analyst reports and investment research",
        },
    }
