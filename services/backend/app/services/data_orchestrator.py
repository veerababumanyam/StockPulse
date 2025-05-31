"""
Data Orchestration Service
Coordinates between all data layers: Cache, Persistent Storage, Vector Storage, and Knowledge Graph
Provides unified data access patterns and intelligent data flow management
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from ..core.events import EventBus
from ..models.market_data import MarketDataSnapshot, TransactionHistory, UserPreferences
from ..models.portfolio import PortfolioSnapshot
from .cache_service import CacheService
from .vector_service import VectorService
from .knowledge_graph_service import KnowledgeGraphService
from .fmp_proxy import FMPProxyService

logger = logging.getLogger(__name__)

class DataOrchestrator:
    """
    Enterprise data orchestration service
    Manages intelligent data flow between all storage layers
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.cache_service = CacheService(event_bus)
        self.vector_service = VectorService(event_bus)
        self.knowledge_graph_service = KnowledgeGraphService(event_bus)
        
        # Data flow configuration
        self.cache_strategies = {
            'market_data': {
                'ttl': 60,  # 1 minute
                'write_through': True,
                'read_through': True,
                'invalidate_on_update': True
            },
            'portfolio_data': {
                'ttl': 300,  # 5 minutes
                'write_through': True,
                'read_through': True,
                'invalidate_on_update': True
            },
            'news_data': {
                'ttl': 1800,  # 30 minutes
                'write_through': False,
                'read_through': True,
                'invalidate_on_update': False
            },
            'ai_insights': {
                'ttl': 1800,  # 30 minutes
                'write_through': True,
                'read_through': True,
                'invalidate_on_update': True
            }
        }
    
    async def initialize(self):
        """Initialize all data services"""
        try:
            await self.cache_service.initialize()
            await self.vector_service.initialize()
            await self.knowledge_graph_service.initialize()
            logger.info("Data orchestrator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize data orchestrator: {e}")
            raise
    
    async def close(self):
        """Close all data service connections"""
        await self.cache_service.close()
        await self.vector_service.close()
        await self.knowledge_graph_service.close()
    
    # Market Data Orchestration
    async def get_market_data(
        self,
        db: AsyncSession,
        user_id: UUID,
        symbol: str,
        data_type: str,
        force_refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Get market data with intelligent caching and fallback
        """
        cache_key = f"{symbol}:{data_type}"
        
        # Try cache first (unless force refresh)
        if not force_refresh:
            cached_data = await self.cache_service.get_market_data(symbol, data_type)
            if cached_data:
                logger.debug(f"Cache hit for market data: {cache_key}")
                return cached_data
        
        # Try persistent storage
        db_data = await self._get_market_data_from_db(db, symbol, data_type)
        if db_data and not self._is_data_stale(db_data, self.cache_strategies['market_data']['ttl']):
            # Cache the fresh data
            await self.cache_service.cache_market_data(symbol, data_type, db_data)
            return db_data
        
        # Fetch fresh data from external API
        fresh_data = await self._fetch_fresh_market_data(db, user_id, symbol, data_type)
        if fresh_data:
            # Store in all layers
            await self._store_market_data_all_layers(db, symbol, data_type, fresh_data)
            return fresh_data
        
        # Return stale data if available
        return db_data
    
    async def store_market_data(
        self,
        db: AsyncSession,
        symbol: str,
        data_type: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Store market data across all appropriate layers"""
        try:
            # Store in cache
            await self.cache_service.cache_market_data(
                symbol, data_type, data, 
                self.cache_strategies['market_data']['ttl']
            )
            
            # Store in persistent storage
            await self._store_market_data_in_db(db, symbol, data_type, data, metadata)
            
            # Store in vector storage if it's news or textual content
            if data_type in ['news', 'analysis', 'insights']:
                await self._store_market_data_in_vector(symbol, data_type, data, metadata)
            
            # Update knowledge graph relationships
            await self._update_knowledge_graph_from_market_data(symbol, data_type, data, metadata)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store market data for {symbol}:{data_type}: {e}")
            return False
    
    # Portfolio Data Orchestration
    async def get_portfolio_data(
        self,
        db: AsyncSession,
        user_id: UUID,
        data_type: str,
        force_refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """Get portfolio data with intelligent caching"""
        
        # Try cache first
        if not force_refresh:
            cached_data = await self.cache_service.get_portfolio_data(user_id, data_type)
            if cached_data:
                logger.debug(f"Cache hit for portfolio data: {user_id}:{data_type}")
                return cached_data
        
        # Get from database and cache
        db_data = await self._get_portfolio_data_from_db(db, user_id, data_type)
        if db_data:
            await self.cache_service.cache_portfolio_data(
                user_id, data_type, db_data,
                self.cache_strategies['portfolio_data']['ttl']
            )
            return db_data
        
        return None
    
    async def store_portfolio_snapshot(
        self,
        db: AsyncSession,
        user_id: UUID,
        portfolio_data: Dict[str, Any],
        holdings: List[Dict[str, Any]],
        performance_metrics: Dict[str, Any]
    ) -> bool:
        """Store portfolio snapshot across all layers"""
        try:
            # Store in persistent storage
            snapshot = PortfolioSnapshot(
                user_id=user_id,
                total_value=portfolio_data.get('total_value', 0),
                cash_balance=portfolio_data.get('cash_balance', 0),
                invested_amount=portfolio_data.get('invested_amount', 0),
                daily_change=portfolio_data.get('daily_change', 0),
                daily_change_percent=portfolio_data.get('daily_change_percent', 0),
                total_gain_loss=portfolio_data.get('total_gain_loss', 0),
                total_gain_loss_percent=portfolio_data.get('total_gain_loss_percent', 0),
                holdings_data=holdings,
                sharpe_ratio=performance_metrics.get('sharpe_ratio'),
                beta=performance_metrics.get('beta'),
                alpha=performance_metrics.get('alpha'),
                max_drawdown=performance_metrics.get('max_drawdown'),
                volatility=performance_metrics.get('volatility')
            )
            
            db.add(snapshot)
            await db.commit()
            
            # Cache the data
            await self.cache_service.cache_portfolio_data(
                user_id, 'overview', portfolio_data
            )
            
            # Store in vector storage for similarity analysis
            await self.vector_service.store_portfolio_embedding(
                str(snapshot.id),
                str(user_id),
                holdings,
                performance_metrics,
                {'snapshot_timestamp': snapshot.snapshot_timestamp.isoformat()}
            )
            
            # Update knowledge graph
            await self.knowledge_graph_service.add_portfolio(
                str(snapshot.id),
                str(user_id),
                f"Portfolio {snapshot.id}",
                holdings,
                {'total_value': portfolio_data.get('total_value', 0)}
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store portfolio snapshot: {e}")
            return False
    
    # News and Content Orchestration
    async def store_news_article(
        self,
        db: AsyncSession,
        article_id: str,
        title: str,
        content: str,
        symbols: List[str],
        sentiment: float,
        metadata: Dict[str, Any]
    ) -> bool:
        """Store news article across vector storage and knowledge graph"""
        try:
            # Store in vector storage for semantic search
            await self.vector_service.store_news_embedding(
                article_id, title, content,
                {
                    'symbols': symbols,
                    'sentiment': sentiment,
                    'source': metadata.get('source', 'unknown'),
                    'published_at': metadata.get('published_at', datetime.utcnow().isoformat())
                }
            )
            
            # Store in cache for quick access
            news_data = {
                'article_id': article_id,
                'title': title,
                'content': content,
                'symbols': symbols,
                'sentiment': sentiment,
                **metadata
            }
            
            await self.cache_service.set(
                'news', article_id, news_data,
                self.cache_strategies['news_data']['ttl']
            )
            
            # Update knowledge graph with news events
            if abs(sentiment) > 0.5:  # Significant sentiment
                await self.knowledge_graph_service.add_market_event(
                    f"news_{article_id}",
                    'news_event',
                    title,
                    content[:500],
                    datetime.utcnow(),
                    symbols,
                    sentiment,
                    metadata
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store news article {article_id}: {e}")
            return False
    
    async def search_related_content(
        self,
        query: str,
        content_types: List[str],
        user_id: Optional[UUID] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for related content across vector storage"""
        try:
            all_results = []
            
            for content_type in content_types:
                if content_type == 'news':
                    results = await self.vector_service.search_similar_news(
                        query, limit=limit
                    )
                elif content_type == 'insights':
                    results = await self.vector_service.search_related_insights(
                        query, limit=limit
                    )
                elif content_type == 'research':
                    results = await self.vector_service.search_company_research(
                        query, limit=limit
                    )
                else:
                    continue
                
                # Add content type to results
                for result in results:
                    result['content_type'] = content_type
                    all_results.append(result)
            
            # Sort by relevance score
            all_results.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            return all_results[:limit]
            
        except Exception as e:
            logger.error(f"Failed to search related content: {e}")
            return []
    
    # AI Insights Orchestration
    async def store_ai_insight(
        self,
        db: AsyncSession,
        insight_id: str,
        title: str,
        content: str,
        insight_type: str,
        confidence: float,
        symbols: List[str],
        metadata: Dict[str, Any]
    ) -> bool:
        """Store AI insight across all appropriate layers"""
        try:
            # Store in vector storage
            await self.vector_service.store_ai_insight_embedding(
                insight_id, title, content, insight_type, confidence,
                {
                    'symbols': symbols,
                    'generated_at': datetime.utcnow().isoformat(),
                    **metadata
                }
            )
            
            # Cache for quick access
            insight_data = {
                'insight_id': insight_id,
                'title': title,
                'content': content,
                'insight_type': insight_type,
                'confidence': confidence,
                'symbols': symbols,
                **metadata
            }
            
            await self.cache_service.set(
                'ai_insights', insight_id, insight_data,
                self.cache_strategies['ai_insights']['ttl']
            )
            
            # Update knowledge graph if high confidence
            if confidence > 0.7:
                await self.knowledge_graph_service.add_market_event(
                    f"insight_{insight_id}",
                    'ai_insight',
                    title,
                    content,
                    datetime.utcnow(),
                    symbols,
                    confidence,
                    metadata
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store AI insight {insight_id}: {e}")
            return False
    
    # Analytics and Insights
    async def analyze_portfolio_risk(
        self,
        db: AsyncSession,
        user_id: UUID,
        portfolio_id: str
    ) -> Dict[str, Any]:
        """Comprehensive portfolio risk analysis using all data layers"""
        try:
            # Get portfolio data from cache/db
            portfolio_data = await self.get_portfolio_data(db, user_id, 'overview')
            if not portfolio_data:
                return {}
            
            # Get knowledge graph risk analysis
            kg_risk = await self.knowledge_graph_service.get_portfolio_risk_exposure(portfolio_id)
            
            # Find similar portfolios from vector storage
            similar_portfolios = await self.vector_service.find_similar_portfolios(
                portfolio_id, limit=5
            )
            
            # Get market correlations from knowledge graph
            holdings = portfolio_data.get('holdings', [])
            correlation_analysis = {}
            
            for holding in holdings[:10]:  # Analyze top 10 holdings
                symbol = holding.get('symbol')
                if symbol:
                    relationships = await self.knowledge_graph_service.get_company_relationships(
                        symbol, ['CORRELATES_WITH', 'INFLUENCES'], max_depth=1
                    )
                    correlation_analysis[symbol] = relationships
            
            # Combine all analyses
            risk_analysis = {
                'portfolio_id': portfolio_id,
                'user_id': str(user_id),
                'timestamp': datetime.utcnow().isoformat(),
                'knowledge_graph_analysis': kg_risk,
                'similar_portfolios': similar_portfolios,
                'correlation_analysis': correlation_analysis,
                'risk_score': self._calculate_composite_risk_score(kg_risk, correlation_analysis),
                'recommendations': self._generate_risk_recommendations(kg_risk, correlation_analysis)
            }
            
            # Cache the analysis
            await self.cache_service.set(
                'portfolio', f"{portfolio_id}:risk_analysis", risk_analysis, 1800  # 30 minutes
            )
            
            return risk_analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze portfolio risk: {e}")
            return {}
    
    async def get_market_insights(
        self,
        db: AsyncSession,
        user_id: UUID,
        symbols: Optional[List[str]] = None,
        insight_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get comprehensive market insights from all data sources"""
        try:
            insights = []
            
            # Get cached insights first
            cache_key = f"market_insights:{':'.join(symbols or [])}:{':'.join(insight_types or [])}"
            cached_insights = await self.cache_service.get('ai_insights', cache_key)
            if cached_insights:
                return cached_insights
            
            # Get AI insights from vector storage
            if symbols:
                for symbol in symbols:
                    symbol_insights = await self.vector_service.search_related_insights(
                        f"stock analysis {symbol}", 
                        insight_type=insight_types[0] if insight_types else None,
                        limit=5
                    )
                    insights.extend(symbol_insights)
            
            # Get market events from knowledge graph
            if symbols:
                for symbol in symbols:
                    influencers = await self.knowledge_graph_service.find_market_influencers(
                        symbol, limit=3
                    )
                    for influencer in influencers:
                        insights.append({
                            'type': 'market_influence',
                            'symbol': symbol,
                            'influencer': influencer,
                            'score': influencer.get('influence_score', 0)
                        })
            
            # Sort by relevance/score
            insights.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            # Cache the results
            await self.cache_service.set('ai_insights', cache_key, insights, 1800)
            
            return insights[:20]  # Return top 20
            
        except Exception as e:
            logger.error(f"Failed to get market insights: {e}")
            return []
    
    # Data Maintenance and Optimization
    async def optimize_data_layers(self, db: AsyncSession):
        """Optimize all data layers for performance"""
        try:
            # Clean up expired cache entries
            await self._cleanup_expired_cache()
            
            # Archive old market data snapshots
            await self._archive_old_market_data(db)
            
            # Update knowledge graph relationships
            await self.knowledge_graph_service.update_relationship_weights()
            
            # Clean up old vector embeddings
            for collection in self.vector_service.collections.keys():
                await self.vector_service.cleanup_old_embeddings(collection, days_old=30)
            
            # Clean up old knowledge graph events
            await self.knowledge_graph_service.cleanup_old_events(days_old=90)
            
            logger.info("Data layer optimization completed")
            
        except Exception as e:
            logger.error(f"Failed to optimize data layers: {e}")
    
    async def get_data_health_metrics(self) -> Dict[str, Any]:
        """Get health metrics for all data layers"""
        try:
            # Cache metrics
            cache_info = await self.cache_service.get_cache_info()
            
            # Vector storage metrics
            vector_metrics = {}
            for collection_name in self.vector_service.collections.keys():
                collection_info = await self.vector_service.get_collection_info(collection_name)
                vector_metrics[collection_name] = collection_info
            
            # Knowledge graph metrics would be implemented here
            # (Graphiti doesn't provide built-in metrics, would need custom implementation)
            
            return {
                'timestamp': datetime.utcnow().isoformat(),
                'cache_metrics': cache_info,
                'vector_metrics': vector_metrics,
                'knowledge_graph_metrics': {},  # Placeholder
                'overall_health': 'healthy'  # Would be calculated based on metrics
            }
            
        except Exception as e:
            logger.error(f"Failed to get data health metrics: {e}")
            return {}
    
    # Private Helper Methods
    async def _get_market_data_from_db(
        self, db: AsyncSession, symbol: str, data_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get market data from persistent storage"""
        try:
            result = await db.execute(
                select(MarketDataSnapshot)
                .where(
                    and_(
                        MarketDataSnapshot.symbol == symbol,
                        MarketDataSnapshot.data_type == data_type,
                        MarketDataSnapshot.expires_at > datetime.utcnow()
                    )
                )
                .order_by(MarketDataSnapshot.timestamp.desc())
                .limit(1)
            )
            
            snapshot = result.scalar_one_or_none()
            if snapshot:
                return snapshot.data_payload
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get market data from DB: {e}")
            return None
    
    async def _store_market_data_in_db(
        self, db: AsyncSession, symbol: str, data_type: str, 
        data: Dict[str, Any], metadata: Optional[Dict[str, Any]]
    ) -> bool:
        """Store market data in persistent storage"""
        try:
            cache_key = f"md:{symbol}:{data_type}"
            ttl_seconds = self.cache_strategies['market_data']['ttl']
            
            snapshot = MarketDataSnapshot(
                symbol=symbol,
                data_type=data_type,
                data_payload=data,
                cache_key=cache_key,
                ttl_seconds=ttl_seconds,
                expires_at=datetime.utcnow() + timedelta(seconds=ttl_seconds),
                price=data.get('price'),
                volume=data.get('volume'),
                market_cap=data.get('market_cap'),
                change=data.get('change'),
                change_percent=data.get('change_percent')
            )
            
            db.add(snapshot)
            await db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Failed to store market data in DB: {e}")
            return False
    
    def _is_data_stale(self, data: Dict[str, Any], ttl_seconds: int) -> bool:
        """Check if data is stale based on TTL"""
        if 'timestamp' not in data:
            return True
        
        try:
            data_time = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            return (datetime.utcnow() - data_time).total_seconds() > ttl_seconds
        except:
            return True
    
    def _calculate_composite_risk_score(
        self, kg_risk: Dict[str, Any], correlation_analysis: Dict[str, Any]
    ) -> float:
        """Calculate composite risk score from multiple analyses"""
        # Simplified risk scoring - would be more sophisticated in production
        concentration_risk = kg_risk.get('concentration_risk', 0)
        correlation_risk = len([
            symbol for symbol, analysis in correlation_analysis.items()
            if len(analysis.get('direct_relationships', [])) > 5
        ]) / max(len(correlation_analysis), 1)
        
        return min((concentration_risk + correlation_risk) / 2, 1.0)
    
    def _generate_risk_recommendations(
        self, kg_risk: Dict[str, Any], correlation_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate risk management recommendations"""
        recommendations = []
        
        concentration_risk = kg_risk.get('concentration_risk', 0)
        if concentration_risk > 0.3:
            recommendations.append("Consider diversifying across more sectors")
        
        correlation_clusters = kg_risk.get('correlation_clusters', [])
        if len(correlation_clusters) > 3:
            recommendations.append("Reduce exposure to highly correlated assets")
        
        if not recommendations:
            recommendations.append("Portfolio risk profile appears balanced")
        
        return recommendations
    
    async def _cleanup_expired_cache(self):
        """Clean up expired cache entries"""
        # This would implement cache cleanup logic
        pass
    
    async def _archive_old_market_data(self, db: AsyncSession):
        """Archive old market data snapshots"""
        # This would implement data archival logic
        pass
    
    async def _fetch_fresh_market_data(
        self, db: AsyncSession, user_id: UUID, symbol: str, data_type: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch fresh market data from external API"""
        try:
            # This would integrate with FMP proxy service
            # For now, return None to indicate no fresh data available
            logger.debug(f"Fresh market data fetch not implemented for {symbol}:{data_type}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to fetch fresh market data: {e}")
            return None
    
    async def _store_market_data_all_layers(
        self, db: AsyncSession, symbol: str, data_type: str, data: Dict[str, Any]
    ) -> bool:
        """Store market data in all appropriate layers"""
        try:
            # Store in cache
            await self.cache_service.cache_market_data(
                symbol, data_type, data, 
                self.cache_strategies['market_data']['ttl']
            )
            
            # Store in persistent storage
            await self._store_market_data_in_db(db, symbol, data_type, data, {})
            
            # Store in vector storage if it's textual content
            if data_type in ['news', 'analysis', 'insights']:
                await self._store_market_data_in_vector(symbol, data_type, data, {})
            
            # Update knowledge graph
            await self._update_knowledge_graph_from_market_data(symbol, data_type, data, {})
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store market data in all layers: {e}")
            return False
    
    async def _store_market_data_in_vector(
        self, symbol: str, data_type: str, data: Dict[str, Any], metadata: Dict[str, Any]
    ) -> bool:
        """Store market data in vector storage"""
        try:
            if data_type == 'news':
                await self.vector_service.store_news_embedding(
                    f"{symbol}_{data_type}_{datetime.utcnow().timestamp()}",
                    data.get('title', ''),
                    data.get('content', ''),
                    {
                        'symbol': symbol,
                        'data_type': data_type,
                        **metadata
                    }
                )
            elif data_type in ['analysis', 'insights']:
                await self.vector_service.store_ai_insight_embedding(
                    f"{symbol}_{data_type}_{datetime.utcnow().timestamp()}",
                    data.get('title', ''),
                    data.get('content', ''),
                    data_type,
                    data.get('confidence', 0.5),
                    {
                        'symbol': symbol,
                        **metadata
                    }
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store market data in vector storage: {e}")
            return False
    
    async def _update_knowledge_graph_from_market_data(
        self, symbol: str, data_type: str, data: Dict[str, Any], metadata: Dict[str, Any]
    ) -> bool:
        """Update knowledge graph with market data insights"""
        try:
            # Add company if not exists
            if 'company_info' in data:
                company_info = data['company_info']
                await self.knowledge_graph_service.add_company(
                    symbol,
                    company_info.get('name', symbol),
                    company_info.get('sector', 'Unknown'),
                    company_info.get('industry', 'Unknown'),
                    company_info.get('market_cap', 0),
                    metadata
                )
            
            # Add market events for significant news
            if data_type == 'news' and data.get('sentiment'):
                sentiment = data.get('sentiment', 0)
                if abs(sentiment) > 0.5:  # Significant sentiment
                    await self.knowledge_graph_service.add_market_event(
                        f"news_{symbol}_{datetime.utcnow().timestamp()}",
                        'news_event',
                        data.get('title', ''),
                        data.get('content', '')[:500],
                        datetime.utcnow(),
                        [symbol],
                        sentiment,
                        metadata
                    )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update knowledge graph: {e}")
            return False
    
    async def _get_portfolio_data_from_db(
        self, db: AsyncSession, user_id: UUID, data_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get portfolio data from persistent storage"""
        try:
            if data_type == 'overview':
                # Get latest portfolio snapshot
                result = await db.execute(
                    select(PortfolioSnapshot)
                    .where(PortfolioSnapshot.user_id == user_id)
                    .order_by(PortfolioSnapshot.snapshot_timestamp.desc())
                    .limit(1)
                )
                
                snapshot = result.scalar_one_or_none()
                if snapshot:
                    return {
                        'total_value': float(snapshot.total_value),
                        'cash_balance': float(snapshot.cash_balance),
                        'invested_amount': float(snapshot.invested_amount),
                        'daily_change': float(snapshot.daily_change),
                        'daily_change_percent': float(snapshot.daily_change_percent),
                        'total_gain_loss': float(snapshot.total_gain_loss),
                        'total_gain_loss_percent': float(snapshot.total_gain_loss_percent),
                        'holdings': snapshot.holdings_data,
                        'performance_metrics': {
                            'sharpe_ratio': float(snapshot.sharpe_ratio) if snapshot.sharpe_ratio else None,
                            'beta': float(snapshot.beta) if snapshot.beta else None,
                            'alpha': float(snapshot.alpha) if snapshot.alpha else None,
                            'max_drawdown': float(snapshot.max_drawdown) if snapshot.max_drawdown else None,
                            'volatility': float(snapshot.volatility) if snapshot.volatility else None
                        }
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get portfolio data from DB: {e}")
            return None

# Global data orchestrator instance
data_orchestrator = DataOrchestrator(EventBus()) 