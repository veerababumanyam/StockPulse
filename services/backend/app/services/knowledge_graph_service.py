"""
Knowledge Graph Service
Graphiti-based knowledge graph for relationship mapping and analytics
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID, uuid4

try:
    from graphiti import Graphiti

    GRAPHITI_AVAILABLE = True
except ImportError:
    GRAPHITI_AVAILABLE = False
    Graphiti = None

from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.events import EventBus

logger = logging.getLogger(__name__)


class KnowledgeGraphService:
    """
    Enterprise knowledge graph service using Graphiti
    Handles relationships between companies, sectors, economic indicators, and portfolios
    """

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.graphiti: Optional[Graphiti] = None

        # Node types
        self.node_types = {
            "company": "Company entity with financial data",
            "sector": "Market sector classification",
            "industry": "Industry classification",
            "economic_indicator": "Economic indicator or metric",
            "portfolio": "Investment portfolio",
            "user": "Platform user",
            "market_event": "Significant market event",
            "news_event": "News event affecting markets",
            "earnings_event": "Company earnings announcement",
            "analyst_rating": "Analyst rating or recommendation",
        }

        # Relationship types
        self.relationship_types = {
            "BELONGS_TO": "Entity belongs to category/group",
            "COMPETES_WITH": "Companies compete in same market",
            "SUPPLIES_TO": "Supply chain relationship",
            "CORRELATES_WITH": "Statistical correlation",
            "INFLUENCES": "One entity influences another",
            "OWNS": "Ownership relationship",
            "TRACKS": "Portfolio tracks index/benchmark",
            "AFFECTS": "Event affects entity",
            "SIMILAR_TO": "Entities are similar",
            "DEPENDS_ON": "Dependency relationship",
        }

    async def initialize(self):
        """Initialize Graphiti client"""
        try:
            if not GRAPHITI_AVAILABLE:
                logger.warning(
                    "Graphiti not available - knowledge graph features will be disabled"
                )
                self.graphiti = None
                return

            self.graphiti = Graphiti(
                neo4j_uri=settings.NEO4J_URI,
                neo4j_user=settings.NEO4J_USER,
                neo4j_password=settings.NEO4J_PASSWORD,
                openai_api_key=settings.OPENAI_API_KEY,
            )

            await self.graphiti.build_indices_and_constraints()
            logger.info("Knowledge graph service initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize knowledge graph service: {e}")
            logger.warning("Knowledge graph features will be disabled")
            self.graphiti = None

    async def close(self):
        """Close Graphiti connection"""
        if self.graphiti:
            await self.graphiti.close()

    def _is_available(self) -> bool:
        """Check if knowledge graph service is available"""
        return GRAPHITI_AVAILABLE and self.graphiti is not None

    # Company and Market Structure Methods
    async def add_company(
        self,
        symbol: str,
        name: str,
        sector: str,
        industry: str,
        market_cap: float,
        metadata: Dict[str, Any],
    ) -> bool:
        """Add company node to knowledge graph"""
        try:
            if not self._is_available():
                logger.debug(
                    "Knowledge graph service not available - skipping add_company"
                )
                return True  # Return success to not break the flow

            if not self.graphiti:
                await self.initialize()

            # Add company node
            company_data = {
                "symbol": symbol,
                "name": name,
                "market_cap": market_cap,
                "type": "company",
                **metadata,
            }

            await self.graphiti.add_node(
                name=f"company_{symbol}", node_type="company", **company_data
            )

            # Add sector if not exists and create relationship
            await self.graphiti.add_node(
                name=f"sector_{sector.lower().replace(' ', '_')}",
                node_type="sector",
                sector_name=sector,
                type="sector",
            )

            await self.graphiti.add_edge(
                source_node_name=f"company_{symbol}",
                target_node_name=f"sector_{sector.lower().replace(' ', '_')}",
                relationship_type="BELONGS_TO",
                weight=1.0,
            )

            # Add industry if not exists and create relationship
            await self.graphiti.add_node(
                name=f"industry_{industry.lower().replace(' ', '_')}",
                node_type="industry",
                industry_name=industry,
                type="industry",
            )

            await self.graphiti.add_edge(
                source_node_name=f"company_{symbol}",
                target_node_name=f"industry_{industry.lower().replace(' ', '_')}",
                relationship_type="BELONGS_TO",
                weight=1.0,
            )

            logger.debug(f"Added company to knowledge graph: {symbol}")
            return True

        except Exception as e:
            logger.error(f"Failed to add company {symbol}: {e}")
            return False

    async def add_correlation_relationship(
        self,
        symbol1: str,
        symbol2: str,
        correlation: float,
        timeframe: str,
        metadata: Dict[str, Any],
    ) -> bool:
        """Add correlation relationship between companies"""
        try:
            if not self.graphiti:
                await self.initialize()

            # Add correlation edge
            await self.graphiti.add_edge(
                source_node_name=f"company_{symbol1}",
                target_node_name=f"company_{symbol2}",
                relationship_type="CORRELATES_WITH",
                weight=abs(correlation),
                correlation=correlation,
                timeframe=timeframe,
                created_at=datetime.utcnow().isoformat(),
                **metadata,
            )

            logger.debug(
                f"Added correlation relationship: {symbol1} <-> {symbol2} ({correlation:.3f})"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to add correlation relationship: {e}")
            return False

    async def add_supply_chain_relationship(
        self,
        supplier_symbol: str,
        customer_symbol: str,
        relationship_strength: float,
        metadata: Dict[str, Any],
    ) -> bool:
        """Add supply chain relationship"""
        try:
            if not self.graphiti:
                await self.initialize()

            await self.graphiti.add_edge(
                source_node_name=f"company_{supplier_symbol}",
                target_node_name=f"company_{customer_symbol}",
                relationship_type="SUPPLIES_TO",
                weight=relationship_strength,
                created_at=datetime.utcnow().isoformat(),
                **metadata,
            )

            logger.debug(
                f"Added supply chain relationship: {supplier_symbol} -> {customer_symbol}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to add supply chain relationship: {e}")
            return False

    # Portfolio and Investment Methods
    async def add_portfolio(
        self,
        portfolio_id: str,
        user_id: str,
        name: str,
        holdings: List[Dict[str, Any]],
        metadata: Dict[str, Any],
    ) -> bool:
        """Add portfolio to knowledge graph"""
        try:
            if not self.graphiti:
                await self.initialize()

            # Add portfolio node
            portfolio_data = {
                "portfolio_id": portfolio_id,
                "user_id": user_id,
                "name": name,
                "type": "portfolio",
                "created_at": datetime.utcnow().isoformat(),
                **metadata,
            }

            await self.graphiti.add_node(
                name=f"portfolio_{portfolio_id}",
                node_type="portfolio",
                **portfolio_data,
            )

            # Add user node if not exists
            await self.graphiti.add_node(
                name=f"user_{user_id}", node_type="user", user_id=user_id, type="user"
            )

            # Create ownership relationship
            await self.graphiti.add_edge(
                source_node_name=f"user_{user_id}",
                target_node_name=f"portfolio_{portfolio_id}",
                relationship_type="OWNS",
                weight=1.0,
            )

            # Add holdings relationships
            for holding in holdings:
                symbol = holding.get("symbol")
                weight = holding.get("weight", 0)

                if symbol and weight > 0:
                    await self.graphiti.add_edge(
                        source_node_name=f"portfolio_{portfolio_id}",
                        target_node_name=f"company_{symbol}",
                        relationship_type="OWNS",
                        weight=weight,
                        quantity=holding.get("quantity", 0),
                        value=holding.get("value", 0),
                    )

            logger.debug(f"Added portfolio to knowledge graph: {portfolio_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to add portfolio {portfolio_id}: {e}")
            return False

    async def find_similar_portfolios(
        self, portfolio_id: str, similarity_threshold: float = 0.3, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Find portfolios with similar holdings"""
        try:
            if not self.graphiti:
                await self.initialize()

            # Query for portfolios with overlapping holdings
            query = f"""
            MATCH (p1:portfolio {{portfolio_id: '{portfolio_id}'}})-[r1:OWNS]->(c:company)
            MATCH (p2:portfolio)-[r2:OWNS]->(c)
            WHERE p1 <> p2
            WITH p1, p2,
                 collect(c.symbol) as common_holdings,
                 sum(r1.weight * r2.weight) as similarity_score,
                 count(c) as overlap_count
            WHERE similarity_score >= {similarity_threshold}
            RETURN p2.portfolio_id as portfolio_id,
                   p2.name as name,
                   p2.user_id as user_id,
                   common_holdings,
                   similarity_score,
                   overlap_count
            ORDER BY similarity_score DESC
            LIMIT {limit}
            """

            results = await self.graphiti.search(query)

            similar_portfolios = []
            for record in results:
                similar_portfolios.append(
                    {
                        "portfolio_id": record["portfolio_id"],
                        "name": record["name"],
                        "user_id": record["user_id"],
                        "common_holdings": record["common_holdings"],
                        "similarity_score": record["similarity_score"],
                        "overlap_count": record["overlap_count"],
                    }
                )

            return similar_portfolios

        except Exception as e:
            logger.error(f"Failed to find similar portfolios: {e}")
            return []

    # Economic Indicators and Market Events
    async def add_economic_indicator(
        self,
        indicator_name: str,
        value: float,
        timestamp: datetime,
        metadata: Dict[str, Any],
    ) -> bool:
        """Add economic indicator to knowledge graph"""
        try:
            if not self.graphiti:
                await self.initialize()

            indicator_data = {
                "name": indicator_name,
                "value": value,
                "timestamp": timestamp.isoformat(),
                "type": "economic_indicator",
                **metadata,
            }

            await self.graphiti.add_node(
                name=f"indicator_{indicator_name.lower().replace(' ', '_')}",
                node_type="economic_indicator",
                **indicator_data,
            )

            logger.debug(f"Added economic indicator: {indicator_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to add economic indicator {indicator_name}: {e}")
            return False

    async def add_market_event(
        self,
        event_id: str,
        event_type: str,
        title: str,
        description: str,
        timestamp: datetime,
        affected_symbols: List[str],
        impact_score: float,
        metadata: Dict[str, Any],
    ) -> bool:
        """Add market event and its relationships"""
        try:
            if not self.graphiti:
                await self.initialize()

            # Add event node
            event_data = {
                "event_id": event_id,
                "event_type": event_type,
                "title": title,
                "description": description,
                "timestamp": timestamp.isoformat(),
                "impact_score": impact_score,
                "type": "market_event",
                **metadata,
            }

            await self.graphiti.add_node(
                name=f"event_{event_id}", node_type="market_event", **event_data
            )

            # Add relationships to affected companies
            for symbol in affected_symbols:
                await self.graphiti.add_edge(
                    source_node_name=f"event_{event_id}",
                    target_node_name=f"company_{symbol}",
                    relationship_type="AFFECTS",
                    weight=abs(impact_score),
                    impact_score=impact_score,
                )

            logger.debug(f"Added market event: {event_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to add market event {event_id}: {e}")
            return False

    # Analysis and Query Methods
    async def get_company_relationships(
        self,
        symbol: str,
        relationship_types: Optional[List[str]] = None,
        max_depth: int = 2,
    ) -> Dict[str, Any]:
        """Get all relationships for a company"""
        try:
            if not self.graphiti:
                await self.initialize()

            # Build relationship filter
            rel_filter = ""
            if relationship_types:
                rel_types = "|".join(relationship_types)
                rel_filter = f":{rel_types}"

            query = f"""
            MATCH path = (c:company {{symbol: '{symbol}'}})-[r{rel_filter}*1..{max_depth}]-(related)
            RETURN c, relationships(path) as rels, nodes(path) as nodes
            """

            results = await self.graphiti.search(query)

            relationships = {
                "company": symbol,
                "direct_relationships": [],
                "indirect_relationships": [],
                "relationship_summary": {},
            }

            for record in results:
                # Process relationships
                rels = record["rels"]
                nodes = record["nodes"]

                if len(rels) == 1:
                    # Direct relationship
                    rel = rels[0]
                    target_node = nodes[-1]
                    relationships["direct_relationships"].append(
                        {
                            "type": rel.type,
                            "target": target_node.get("symbol")
                            or target_node.get("name"),
                            "target_type": target_node.get("type"),
                            "weight": rel.get("weight", 0),
                            "properties": dict(rel),
                        }
                    )
                else:
                    # Indirect relationship
                    path_description = " -> ".join(
                        [node.get("symbol") or node.get("name") for node in nodes]
                    )
                    relationships["indirect_relationships"].append(
                        {
                            "path": path_description,
                            "length": len(rels),
                            "relationships": [rel.type for rel in rels],
                        }
                    )

            # Create summary
            rel_counts = {}
            for rel in relationships["direct_relationships"]:
                rel_type = rel["type"]
                rel_counts[rel_type] = rel_counts.get(rel_type, 0) + 1

            relationships["relationship_summary"] = rel_counts

            return relationships

        except Exception as e:
            logger.error(f"Failed to get company relationships for {symbol}: {e}")
            return {}

    async def find_market_influencers(
        self, symbol: str, influence_threshold: float = 0.5, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Find entities that influence a company's stock price"""
        try:
            if not self.graphiti:
                await self.initialize()

            query = f"""
            MATCH (influencer)-[r:INFLUENCES|CORRELATES_WITH|AFFECTS]->(c:company {{symbol: '{symbol}'}})
            WHERE r.weight >= {influence_threshold}
            RETURN influencer, r,
                   r.weight as influence_score,
                   influencer.type as influencer_type
            ORDER BY r.weight DESC
            LIMIT {limit}
            """

            results = await self.graphiti.search(query)

            influencers = []
            for record in results:
                influencer = record["influencer"]
                relationship = record["r"]

                influencers.append(
                    {
                        "name": influencer.get("name") or influencer.get("symbol"),
                        "type": influencer.get("type"),
                        "influence_score": record["influence_score"],
                        "relationship_type": relationship.type,
                        "properties": dict(relationship),
                    }
                )

            return influencers

        except Exception as e:
            logger.error(f"Failed to find market influencers for {symbol}: {e}")
            return []

    async def analyze_sector_correlations(
        self, sector: str, correlation_threshold: float = 0.3
    ) -> Dict[str, Any]:
        """Analyze correlations within a sector"""
        try:
            if not self.graphiti:
                await self.initialize()

            query = f"""
            MATCH (s:sector {{name: '{sector}'}})<-[:BELONGS_TO]-(c1:company)
            MATCH (c1)-[r:CORRELATES_WITH]-(c2:company)-[:BELONGS_TO]->(s)
            WHERE r.correlation >= {correlation_threshold}
            RETURN c1.symbol as symbol1, c2.symbol as symbol2,
                   r.correlation as correlation,
                   r.timeframe as timeframe
            ORDER BY r.correlation DESC
            """

            results = await self.graphiti.search(query)

            correlations = []
            correlation_matrix = {}

            for record in results:
                symbol1 = record["symbol1"]
                symbol2 = record["symbol2"]
                correlation = record["correlation"]

                correlations.append(
                    {
                        "symbol1": symbol1,
                        "symbol2": symbol2,
                        "correlation": correlation,
                        "timeframe": record["timeframe"],
                    }
                )

                # Build correlation matrix
                if symbol1 not in correlation_matrix:
                    correlation_matrix[symbol1] = {}
                correlation_matrix[symbol1][symbol2] = correlation

            return {
                "sector": sector,
                "correlations": correlations,
                "correlation_matrix": correlation_matrix,
                "avg_correlation": sum(c["correlation"] for c in correlations)
                / len(correlations)
                if correlations
                else 0,
            }

        except Exception as e:
            logger.error(f"Failed to analyze sector correlations for {sector}: {e}")
            return {}

    async def get_portfolio_risk_exposure(self, portfolio_id: str) -> Dict[str, Any]:
        """Analyze portfolio risk exposure through knowledge graph"""
        try:
            if not self.graphiti:
                await self.initialize()

            query = f"""
            MATCH (p:portfolio {{portfolio_id: '{portfolio_id}'}})-[owns:OWNS]->(c:company)
            MATCH (c)-[:BELONGS_TO]->(s:sector)
            OPTIONAL MATCH (c)-[corr:CORRELATES_WITH]-(other:company)
            WHERE corr.correlation > 0.7
            RETURN c.symbol as symbol, owns.weight as weight,
                   s.name as sector,
                   collect(other.symbol) as highly_correlated
            """

            results = await self.graphiti.search(query)

            risk_analysis = {
                "portfolio_id": portfolio_id,
                "sector_exposure": {},
                "correlation_clusters": [],
                "concentration_risk": 0,
                "diversification_score": 0,
            }

            total_weight = 0
            sector_weights = {}

            for record in results:
                symbol = record["symbol"]
                weight = record["weight"]
                sector = record["sector"]

                total_weight += weight
                sector_weights[sector] = sector_weights.get(sector, 0) + weight

                # Track correlation clusters
                if record["highly_correlated"]:
                    risk_analysis["correlation_clusters"].append(
                        {
                            "symbol": symbol,
                            "weight": weight,
                            "correlated_with": record["highly_correlated"],
                        }
                    )

            # Calculate sector exposure
            for sector, weight in sector_weights.items():
                risk_analysis["sector_exposure"][sector] = (
                    weight / total_weight if total_weight > 0 else 0
                )

            # Calculate concentration risk (Herfindahl index)
            if total_weight > 0:
                risk_analysis["concentration_risk"] = sum(
                    (weight / total_weight) ** 2 for weight in sector_weights.values()
                )
                risk_analysis["diversification_score"] = (
                    1 - risk_analysis["concentration_risk"]
                )

            return risk_analysis

        except Exception as e:
            logger.error(f"Failed to analyze portfolio risk exposure: {e}")
            return {}

    # Maintenance and Utilities
    async def update_relationship_weights(self):
        """Update relationship weights based on recent data"""
        try:
            if not self.graphiti:
                await self.initialize()

            # This would implement logic to update correlation weights
            # based on recent market data
            logger.info("Updating relationship weights in knowledge graph")

        except Exception as e:
            logger.error(f"Failed to update relationship weights: {e}")

    async def cleanup_old_events(self, days_old: int = 90) -> int:
        """Clean up old market events"""
        try:
            if not self.graphiti:
                await self.initialize()

            cutoff_date = datetime.utcnow() - timedelta(days=days_old)

            query = f"""
            MATCH (e:market_event)
            WHERE datetime(e.timestamp) < datetime('{cutoff_date.isoformat()}')
            DETACH DELETE e
            RETURN count(e) as deleted_count
            """

            results = await self.graphiti.search(query)
            deleted_count = results[0]["deleted_count"] if results else 0

            logger.info(f"Cleaned up {deleted_count} old market events")
            return deleted_count

        except Exception as e:
            logger.error(f"Failed to cleanup old events: {e}")
            return 0


# Global knowledge graph service instance
knowledge_graph_service = KnowledgeGraphService(EventBus())
