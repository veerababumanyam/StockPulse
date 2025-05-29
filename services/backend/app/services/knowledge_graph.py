"""
Graphiti Knowledge Graph Service for StockPulse RAG capabilities.
Handles real-time financial knowledge graph operations using Graphiti.
"""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

try:
    from graphiti_core import Graphiti
    from graphiti_core.edges import Edge
    from graphiti_core.nodes import EpisodicNode

    GRAPHITI_AVAILABLE = True
except ImportError:
    GRAPHITI_AVAILABLE = False
    Graphiti = None
    EpisodicNode = None
    Edge = None

from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class GraphitiError(Exception):
    """Custom exception for Graphiti-related errors."""

    pass


class StockPulseKnowledgeGraph:
    """
    StockPulse Knowledge Graph service using Graphiti for RAG.

    Handles financial knowledge ingestion, semantic search, and temporal tracking
    for real-time financial intelligence.
    """

    def __init__(self):
        """Initialize the knowledge graph service."""
        if not GRAPHITI_AVAILABLE:
            raise GraphitiError(
                "Graphiti is not available. Install with: pip install graphiti-core"
            )

        self.graphiti: Optional[Graphiti] = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the Graphiti connection and setup."""
        try:
            self.graphiti = Graphiti(
                uri=settings.NEO4J_URI,
                user=settings.NEO4J_USER,
                password=settings.NEO4J_PASSWORD,
                database=settings.NEO4J_DATABASE,
            )

            # Initialize Graphiti indices and constraints
            await self.graphiti.build_indices_and_constraints()
            self._initialized = True

            logger.info("Graphiti Knowledge Graph initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Graphiti: {e}")
            raise GraphitiError(f"Initialization failed: {e}")

    async def add_financial_news(
        self,
        title: str,
        content: str,
        source: str,
        symbols: List[str],
        published_at: datetime,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Add financial news to the knowledge graph.

        Args:
            title: News article title
            content: Full article content
            source: News source (e.g., "Reuters", "Bloomberg")
            symbols: List of stock symbols mentioned
            published_at: Publication timestamp
            metadata: Additional metadata (sentiment, category, etc.)

        Returns:
            Episode ID for the added news
        """
        if not self._initialized:
            await self.initialize()

        episode_data = {
            "type": "financial_news",
            "title": title,
            "content": content,
            "source": source,
            "symbols": symbols,
            "published_at": published_at.isoformat(),
            "metadata": metadata or {},
        }

        try:
            episode_id = await self.graphiti.add_episode(
                name=f"news_{published_at.strftime('%Y%m%d_%H%M%S')}_{source}",
                episode=episode_data,
                group_id="financial_news",
            )

            logger.info(f"Added financial news episode: {episode_id}")
            return episode_id

        except Exception as e:
            logger.error(f"Failed to add financial news: {e}")
            raise GraphitiError(f"Failed to add news: {e}")

    async def add_company_filing(
        self,
        symbol: str,
        filing_type: str,
        content: str,
        filing_date: datetime,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Add SEC filing or company document to knowledge graph.

        Args:
            symbol: Stock symbol
            filing_type: Type of filing (10-K, 10-Q, 8-K, etc.)
            content: Document content or summary
            filing_date: Filing date
            metadata: Additional metadata

        Returns:
            Episode ID for the added filing
        """
        if not self._initialized:
            await self.initialize()

        episode_data = {
            "type": "company_filing",
            "symbol": symbol,
            "filing_type": filing_type,
            "content": content,
            "filing_date": filing_date.isoformat(),
            "metadata": metadata or {},
        }

        try:
            episode_id = await self.graphiti.add_episode(
                name=f"filing_{symbol}_{filing_type}_{filing_date.strftime('%Y%m%d')}",
                episode=episode_data,
                group_id="company_filings",
            )

            logger.info(f"Added company filing episode: {episode_id}")
            return episode_id

        except Exception as e:
            logger.error(f"Failed to add company filing: {e}")
            raise GraphitiError(f"Failed to add filing: {e}")

    async def add_user_interaction(
        self, user_id: str, action: str, context: Dict[str, Any], timestamp: datetime
    ) -> str:
        """
        Add user interaction to build personalized knowledge.

        Args:
            user_id: User identifier
            action: Action type (search, trade, view, etc.)
            context: Interaction context (symbols, amounts, etc.)
            timestamp: When the interaction occurred

        Returns:
            Episode ID for the interaction
        """
        if not self._initialized:
            await self.initialize()

        episode_data = {
            "type": "user_interaction",
            "user_id": user_id,
            "action": action,
            "context": context,
            "timestamp": timestamp.isoformat(),
        }

        try:
            episode_id = await self.graphiti.add_episode(
                name=f"interaction_{user_id}_{action}_{timestamp.strftime('%Y%m%d_%H%M%S')}",
                episode=episode_data,
                group_id="user_interactions",
            )

            logger.info(f"Added user interaction episode: {episode_id}")
            return episode_id

        except Exception as e:
            logger.error(f"Failed to add user interaction: {e}")
            raise GraphitiError(f"Failed to add interaction: {e}")

    async def search_knowledge(
        self, query: str, group_id: Optional[str] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search the knowledge graph using hybrid semantic search.

        Args:
            query: Search query
            group_id: Optional group to search within
            limit: Maximum number of results

        Returns:
            List of search results with relevance scores
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Use Graphiti's hybrid search capabilities
            results = await self.graphiti.search(
                query=query, group_id=group_id, limit=limit
            )

            # Format results for StockPulse consumption
            formatted_results = []
            for result in results:
                formatted_results.append(
                    {
                        "content": result.get("content", ""),
                        "score": result.get("score", 0.0),
                        "metadata": result.get("metadata", {}),
                        "episode_id": result.get("episode_id"),
                        "group_id": result.get("group_id"),
                    }
                )

            logger.info(f"Knowledge search returned {len(formatted_results)} results")
            return formatted_results

        except Exception as e:
            logger.error(f"Knowledge search failed: {e}")
            raise GraphitiError(f"Search failed: {e}")

    async def get_related_entities(
        self, entity_name: str, entity_type: Optional[str] = None, max_distance: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Find entities related to a given entity through the knowledge graph.

        Args:
            entity_name: Name of the entity to find relations for
            entity_type: Optional entity type filter
            max_distance: Maximum graph distance to search

        Returns:
            List of related entities with relationship information
        """
        if not self._initialized:
            await self.initialize()

        try:
            # Use Graphiti's graph traversal capabilities
            related_entities = await self.graphiti.get_related_nodes(
                node_name=entity_name, node_type=entity_type, max_distance=max_distance
            )

            return related_entities

        except Exception as e:
            logger.error(f"Failed to get related entities: {e}")
            raise GraphitiError(f"Related entities search failed: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """
        Check the health of the knowledge graph service.

        Returns:
            Health status information
        """
        try:
            if not self._initialized:
                return {"status": "not_initialized", "healthy": False}

            # Test connection with a simple operation
            await self.graphiti.get_node_count()

            return {
                "status": "healthy",
                "healthy": True,
                "neo4j_uri": settings.NEO4J_URI,
                "database": settings.NEO4J_DATABASE,
            }

        except Exception as e:
            logger.error(f"Knowledge graph health check failed: {e}")
            return {"status": "unhealthy", "healthy": False, "error": str(e)}


# Global instance
knowledge_graph = StockPulseKnowledgeGraph()


async def get_knowledge_graph() -> StockPulseKnowledgeGraph:
    """Dependency injection for knowledge graph service."""
    if not knowledge_graph._initialized:
        await knowledge_graph.initialize()
    return knowledge_graph
