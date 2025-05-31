"""
Vector Storage Service
Qdrant-based vector storage for embeddings and semantic search
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union
from uuid import UUID, uuid4
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import openai
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.events import EventBus

logger = logging.getLogger(__name__)

class VectorService:
    """
    Enterprise vector storage service using Qdrant
    Handles embeddings for news, research, insights, and portfolio analysis
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.client: Optional[QdrantClient] = None
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Collection configurations
        self.collections = {
            'market_news': {
                'vector_size': 1536,  # OpenAI ada-002 embedding size
                'distance': Distance.COSINE,
                'description': 'Market news articles and sentiment analysis'
            },
            'company_research': {
                'vector_size': 1536,
                'distance': Distance.COSINE,
                'description': 'Company research documents and analysis'
            },
            'portfolio_analysis': {
                'vector_size': 1536,
                'distance': Distance.COSINE,
                'description': 'Portfolio analysis and similarity search'
            },
            'ai_insights': {
                'vector_size': 1536,
                'distance': Distance.COSINE,
                'description': 'AI-generated insights and recommendations'
            },
            'economic_indicators': {
                'vector_size': 1536,
                'distance': Distance.COSINE,
                'description': 'Economic indicators and market analysis'
            }
        }
    
    async def initialize(self):
        """Initialize Qdrant client and collections"""
        try:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                api_key=settings.QDRANT_API_KEY,
                timeout=30
            )
            
            # Create collections if they don't exist
            await self._ensure_collections()
            logger.info("Vector service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector service: {e}")
            raise
    
    async def _ensure_collections(self):
        """Ensure all required collections exist"""
        for collection_name, config in self.collections.items():
            try:
                # Check if collection exists
                collections = self.client.get_collections()
                existing_names = [col.name for col in collections.collections]
                
                if collection_name not in existing_names:
                    # Create collection
                    self.client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(
                            size=config['vector_size'],
                            distance=config['distance']
                        )
                    )
                    logger.info(f"Created vector collection: {collection_name}")
                else:
                    logger.debug(f"Vector collection already exists: {collection_name}")
                    
            except Exception as e:
                logger.error(f"Failed to create collection {collection_name}: {e}")
                raise
    
    async def generate_embedding(self, text: str, model: str = "text-embedding-ada-002") -> List[float]:
        """Generate embedding for text using OpenAI"""
        try:
            response = await self.openai_client.embeddings.create(
                input=text,
                model=model
            )
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def store_embedding(
        self,
        collection_name: str,
        point_id: str,
        vector: List[float],
        payload: Dict[str, Any]
    ) -> bool:
        """Store embedding in specified collection"""
        if not self.client:
            await self.initialize()
        
        try:
            point = PointStruct(
                id=point_id,
                vector=vector,
                payload=payload
            )
            
            operation_info = self.client.upsert(
                collection_name=collection_name,
                points=[point]
            )
            
            logger.debug(f"Stored embedding in {collection_name}: {point_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store embedding in {collection_name}: {e}")
            return False
    
    async def search_similar(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.7,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors"""
        if not self.client:
            await self.initialize()
        
        try:
            # Build filter if provided
            query_filter = None
            if filter_conditions:
                conditions = []
                for field, value in filter_conditions.items():
                    conditions.append(
                        FieldCondition(key=field, match=MatchValue(value=value))
                    )
                query_filter = Filter(must=conditions)
            
            # Perform search
            search_result = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=limit,
                score_threshold=score_threshold
            )
            
            # Format results
            results = []
            for scored_point in search_result:
                results.append({
                    'id': scored_point.id,
                    'score': scored_point.score,
                    'payload': scored_point.payload
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search in {collection_name}: {e}")
            return []
    
    async def delete_embedding(self, collection_name: str, point_id: str) -> bool:
        """Delete embedding from collection"""
        if not self.client:
            await self.initialize()
        
        try:
            self.client.delete(
                collection_name=collection_name,
                points_selector=models.PointIdsList(
                    points=[point_id]
                )
            )
            
            logger.debug(f"Deleted embedding from {collection_name}: {point_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete embedding from {collection_name}: {e}")
            return False
    
    # Market News Methods
    async def store_news_embedding(
        self,
        article_id: str,
        title: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Store news article embedding"""
        try:
            # Combine title and content for embedding
            text = f"{title}\n\n{content}"
            embedding = await self.generate_embedding(text)
            
            payload = {
                'article_id': article_id,
                'title': title,
                'content': content[:1000],  # Truncate for storage
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'news_article',
                **metadata
            }
            
            return await self.store_embedding(
                'market_news',
                article_id,
                embedding,
                payload
            )
            
        except Exception as e:
            logger.error(f"Failed to store news embedding: {e}")
            return False
    
    async def search_similar_news(
        self,
        query_text: str,
        limit: int = 10,
        symbols: Optional[List[str]] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar news articles"""
        try:
            query_embedding = await self.generate_embedding(query_text)
            
            # Build filter conditions
            filter_conditions = {}
            if symbols:
                filter_conditions['symbols'] = symbols
            
            return await self.search_similar(
                'market_news',
                query_embedding,
                limit=limit,
                filter_conditions=filter_conditions
            )
            
        except Exception as e:
            logger.error(f"Failed to search similar news: {e}")
            return []
    
    # Company Research Methods
    async def store_research_embedding(
        self,
        research_id: str,
        symbol: str,
        title: str,
        content: str,
        research_type: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Store company research embedding"""
        try:
            text = f"{symbol} {title}\n\n{content}"
            embedding = await self.generate_embedding(text)
            
            payload = {
                'research_id': research_id,
                'symbol': symbol,
                'title': title,
                'content': content[:1000],
                'research_type': research_type,  # 'analyst_report', 'earnings_call', 'sec_filing'
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'company_research',
                **metadata
            }
            
            return await self.store_embedding(
                'company_research',
                research_id,
                embedding,
                payload
            )
            
        except Exception as e:
            logger.error(f"Failed to store research embedding: {e}")
            return False
    
    async def search_company_research(
        self,
        query_text: str,
        symbol: Optional[str] = None,
        research_type: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search company research documents"""
        try:
            query_embedding = await self.generate_embedding(query_text)
            
            filter_conditions = {}
            if symbol:
                filter_conditions['symbol'] = symbol
            if research_type:
                filter_conditions['research_type'] = research_type
            
            return await self.search_similar(
                'company_research',
                query_embedding,
                limit=limit,
                filter_conditions=filter_conditions
            )
            
        except Exception as e:
            logger.error(f"Failed to search company research: {e}")
            return []
    
    # Portfolio Analysis Methods
    async def store_portfolio_embedding(
        self,
        portfolio_id: str,
        user_id: str,
        holdings: List[Dict[str, Any]],
        performance_metrics: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> bool:
        """Store portfolio analysis embedding"""
        try:
            # Create text representation of portfolio
            holdings_text = ", ".join([
                f"{holding['symbol']} ({holding['weight']:.1%})"
                for holding in holdings
            ])
            
            metrics_text = ", ".join([
                f"{key}: {value}"
                for key, value in performance_metrics.items()
            ])
            
            text = f"Portfolio Holdings: {holdings_text}\nMetrics: {metrics_text}"
            embedding = await self.generate_embedding(text)
            
            payload = {
                'portfolio_id': portfolio_id,
                'user_id': user_id,
                'holdings': holdings,
                'performance_metrics': performance_metrics,
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'portfolio_analysis',
                **metadata
            }
            
            return await self.store_embedding(
                'portfolio_analysis',
                portfolio_id,
                embedding,
                payload
            )
            
        except Exception as e:
            logger.error(f"Failed to store portfolio embedding: {e}")
            return False
    
    async def find_similar_portfolios(
        self,
        portfolio_id: str,
        limit: int = 10,
        exclude_user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Find portfolios similar to the given portfolio"""
        try:
            # Get the portfolio embedding
            portfolio_info = self.client.retrieve(
                collection_name='portfolio_analysis',
                ids=[portfolio_id]
            )
            
            if not portfolio_info:
                return []
            
            portfolio_vector = portfolio_info[0].vector
            
            filter_conditions = {}
            if exclude_user_id:
                # Note: Qdrant doesn't support "not equal" directly
                # This would need to be handled in post-processing
                pass
            
            results = await self.search_similar(
                'portfolio_analysis',
                portfolio_vector,
                limit=limit + 1,  # +1 to account for self-match
                filter_conditions=filter_conditions
            )
            
            # Remove self-match and user's own portfolios
            filtered_results = []
            for result in results:
                if (result['id'] != portfolio_id and 
                    (not exclude_user_id or result['payload'].get('user_id') != exclude_user_id)):
                    filtered_results.append(result)
            
            return filtered_results[:limit]
            
        except Exception as e:
            logger.error(f"Failed to find similar portfolios: {e}")
            return []
    
    # AI Insights Methods
    async def store_ai_insight_embedding(
        self,
        insight_id: str,
        title: str,
        content: str,
        insight_type: str,
        confidence: float,
        metadata: Dict[str, Any]
    ) -> bool:
        """Store AI-generated insight embedding"""
        try:
            text = f"{title}\n\n{content}"
            embedding = await self.generate_embedding(text)
            
            payload = {
                'insight_id': insight_id,
                'title': title,
                'content': content,
                'insight_type': insight_type,  # 'market_trend', 'risk_alert', 'opportunity'
                'confidence': confidence,
                'timestamp': datetime.utcnow().isoformat(),
                'type': 'ai_insight',
                **metadata
            }
            
            return await self.store_embedding(
                'ai_insights',
                insight_id,
                embedding,
                payload
            )
            
        except Exception as e:
            logger.error(f"Failed to store AI insight embedding: {e}")
            return False
    
    async def search_related_insights(
        self,
        query_text: str,
        insight_type: Optional[str] = None,
        min_confidence: float = 0.5,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for related AI insights"""
        try:
            query_embedding = await self.generate_embedding(query_text)
            
            filter_conditions = {}
            if insight_type:
                filter_conditions['insight_type'] = insight_type
            
            results = await self.search_similar(
                'ai_insights',
                query_embedding,
                limit=limit,
                filter_conditions=filter_conditions
            )
            
            # Filter by confidence
            filtered_results = [
                result for result in results
                if result['payload'].get('confidence', 0) >= min_confidence
            ]
            
            return filtered_results
            
        except Exception as e:
            logger.error(f"Failed to search related insights: {e}")
            return []
    
    # Collection Management
    async def get_collection_info(self, collection_name: str) -> Dict[str, Any]:
        """Get information about a collection"""
        if not self.client:
            await self.initialize()
        
        try:
            info = self.client.get_collection(collection_name)
            return {
                'name': collection_name,
                'vectors_count': info.vectors_count,
                'indexed_vectors_count': info.indexed_vectors_count,
                'points_count': info.points_count,
                'segments_count': info.segments_count,
                'status': info.status,
                'optimizer_status': info.optimizer_status,
                'disk_data_size': info.disk_data_size,
                'ram_data_size': info.ram_data_size
            }
            
        except Exception as e:
            logger.error(f"Failed to get collection info for {collection_name}: {e}")
            return {}
    
    async def cleanup_old_embeddings(
        self,
        collection_name: str,
        days_old: int = 30
    ) -> int:
        """Clean up old embeddings from collection"""
        if not self.client:
            await self.initialize()
        
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            # This is a simplified cleanup - in production you'd want more sophisticated logic
            # Qdrant doesn't have built-in date filtering, so this would need custom implementation
            logger.info(f"Cleanup requested for {collection_name} older than {days_old} days")
            return 0
            
        except Exception as e:
            logger.error(f"Failed to cleanup old embeddings: {e}")
            return 0

# Global vector service instance
vector_service = VectorService(EventBus()) 