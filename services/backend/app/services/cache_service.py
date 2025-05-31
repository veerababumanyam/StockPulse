"""
Redis Cache Service
Enterprise-grade caching layer with TTL management and performance monitoring
"""
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union, Tuple
from uuid import UUID
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..models.market_data import CacheMetrics
from ..core.events import EventBus

logger = logging.getLogger(__name__)

class CacheService:
    """
    Enterprise Redis caching service with intelligent TTL management
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.redis_client: Optional[redis.Redis] = None
        self.metrics = CacheMetricsCollector()
        
        # Cache configuration
        self.default_ttl = {
            'market_data': 60,      # 1 minute for market data
            'portfolio': 300,       # 5 minutes for portfolio data
            'user_session': 3600,   # 1 hour for user sessions
            'news': 1800,          # 30 minutes for news
            'economic_data': 3600,  # 1 hour for economic data
            'ai_insights': 1800,   # 30 minutes for AI insights
            'watchlist': 180,      # 3 minutes for watchlist
            'alerts': 60,          # 1 minute for alerts
        }
        
        # Cache key prefixes
        self.key_prefixes = {
            'market_data': 'md:',
            'portfolio': 'pf:',
            'user_session': 'us:',
            'news': 'nw:',
            'economic_data': 'ec:',
            'ai_insights': 'ai:',
            'watchlist': 'wl:',
            'alerts': 'al:',
            'rate_limit': 'rl:',
        }
    
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                db=settings.REDIS_DB,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Redis cache service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Redis cache service: {e}")
            raise
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
    
    def _build_cache_key(self, cache_type: str, key: str, user_id: Optional[UUID] = None) -> str:
        """Build standardized cache key"""
        prefix = self.key_prefixes.get(cache_type, 'misc:')
        if user_id:
            return f"{prefix}{user_id}:{key}"
        return f"{prefix}{key}"
    
    async def set(
        self,
        cache_type: str,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None,
        user_id: Optional[UUID] = None
    ) -> bool:
        """
        Set cache value with intelligent TTL management
        """
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        ttl = ttl_seconds or self.default_ttl.get(cache_type, 300)
        
        try:
            start_time = datetime.utcnow()
            
            # Serialize value
            serialized_value = json.dumps(value, default=str)
            
            # Set with TTL
            result = await self.redis_client.setex(cache_key, ttl, serialized_value)
            
            # Record metrics
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            await self.metrics.record_set_operation(cache_type, cache_key, response_time, len(serialized_value))
            
            logger.debug(f"Cache SET: {cache_key} (TTL: {ttl}s)")
            return result
            
        except Exception as e:
            logger.error(f"Cache SET failed for {cache_key}: {e}")
            return False
    
    async def get(
        self,
        cache_type: str,
        key: str,
        user_id: Optional[UUID] = None
    ) -> Optional[Any]:
        """
        Get cache value with hit/miss tracking
        """
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        
        try:
            start_time = datetime.utcnow()
            
            # Get value
            serialized_value = await self.redis_client.get(cache_key)
            
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            if serialized_value:
                # Cache hit
                await self.metrics.record_hit(cache_type, cache_key, response_time)
                logger.debug(f"Cache HIT: {cache_key}")
                return json.loads(serialized_value)
            else:
                # Cache miss
                await self.metrics.record_miss(cache_type, cache_key, response_time)
                logger.debug(f"Cache MISS: {cache_key}")
                return None
                
        except Exception as e:
            logger.error(f"Cache GET failed for {cache_key}: {e}")
            await self.metrics.record_miss(cache_type, cache_key, 0)
            return None
    
    async def delete(
        self,
        cache_type: str,
        key: str,
        user_id: Optional[UUID] = None
    ) -> bool:
        """Delete cache entry"""
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        
        try:
            result = await self.redis_client.delete(cache_key)
            logger.debug(f"Cache DELETE: {cache_key}")
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache DELETE failed for {cache_key}: {e}")
            return False
    
    async def exists(
        self,
        cache_type: str,
        key: str,
        user_id: Optional[UUID] = None
    ) -> bool:
        """Check if cache key exists"""
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        
        try:
            result = await self.redis_client.exists(cache_key)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache EXISTS failed for {cache_key}: {e}")
            return False
    
    async def get_ttl(
        self,
        cache_type: str,
        key: str,
        user_id: Optional[UUID] = None
    ) -> int:
        """Get remaining TTL for cache key"""
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        
        try:
            ttl = await self.redis_client.ttl(cache_key)
            return ttl
            
        except Exception as e:
            logger.error(f"Cache TTL failed for {cache_key}: {e}")
            return -1
    
    async def extend_ttl(
        self,
        cache_type: str,
        key: str,
        additional_seconds: int,
        user_id: Optional[UUID] = None
    ) -> bool:
        """Extend TTL for existing cache entry"""
        if not self.redis_client:
            await self.initialize()
        
        cache_key = self._build_cache_key(cache_type, key, user_id)
        
        try:
            current_ttl = await self.redis_client.ttl(cache_key)
            if current_ttl > 0:
                new_ttl = current_ttl + additional_seconds
                result = await self.redis_client.expire(cache_key, new_ttl)
                logger.debug(f"Cache TTL extended: {cache_key} (+{additional_seconds}s)")
                return result
            return False
            
        except Exception as e:
            logger.error(f"Cache TTL extension failed for {cache_key}: {e}")
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all cache keys matching pattern"""
        if not self.redis_client:
            await self.initialize()
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                deleted = await self.redis_client.delete(*keys)
                logger.info(f"Cache invalidated {deleted} keys matching pattern: {pattern}")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Cache pattern invalidation failed for {pattern}: {e}")
            return 0
    
    async def get_cache_info(self) -> Dict[str, Any]:
        """Get cache statistics and health information"""
        if not self.redis_client:
            await self.initialize()
        
        try:
            info = await self.redis_client.info()
            memory_info = await self.redis_client.info('memory')
            
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': memory_info.get('used_memory', 0),
                'used_memory_human': memory_info.get('used_memory_human', '0B'),
                'used_memory_peak': memory_info.get('used_memory_peak', 0),
                'total_commands_processed': info.get('total_commands_processed', 0),
                'instantaneous_ops_per_sec': info.get('instantaneous_ops_per_sec', 0),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'hit_rate': self._calculate_hit_rate(
                    info.get('keyspace_hits', 0),
                    info.get('keyspace_misses', 0)
                )
            }
            
        except Exception as e:
            logger.error(f"Failed to get cache info: {e}")
            return {}
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        """Calculate cache hit rate percentage"""
        total = hits + misses
        if total == 0:
            return 0.0
        return (hits / total) * 100
    
    # Market Data Specific Methods
    async def cache_market_data(
        self,
        symbol: str,
        data_type: str,
        data: Dict[str, Any],
        ttl_seconds: Optional[int] = None
    ) -> bool:
        """Cache market data with symbol-specific key"""
        key = f"{symbol}:{data_type}"
        return await self.set('market_data', key, data, ttl_seconds)
    
    async def get_market_data(
        self,
        symbol: str,
        data_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached market data"""
        key = f"{symbol}:{data_type}"
        return await self.get('market_data', key)
    
    async def cache_portfolio_data(
        self,
        user_id: UUID,
        data_type: str,
        data: Dict[str, Any],
        ttl_seconds: Optional[int] = None
    ) -> bool:
        """Cache user portfolio data"""
        return await self.set('portfolio', data_type, data, ttl_seconds, user_id)
    
    async def get_portfolio_data(
        self,
        user_id: UUID,
        data_type: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached portfolio data"""
        return await self.get('portfolio', data_type, user_id)
    
    async def invalidate_user_cache(self, user_id: UUID) -> int:
        """Invalidate all cache entries for a user"""
        patterns = [
            f"pf:{user_id}:*",  # Portfolio data
            f"us:{user_id}:*",  # User sessions
            f"wl:{user_id}:*",  # Watchlist
            f"al:{user_id}:*",  # Alerts
        ]
        
        total_deleted = 0
        for pattern in patterns:
            deleted = await self.invalidate_pattern(pattern)
            total_deleted += deleted
        
        return total_deleted

class CacheMetricsCollector:
    """
    Collects and aggregates cache performance metrics
    """
    
    def __init__(self):
        self.metrics_buffer = []
        self.buffer_size = 1000
        self.flush_interval = 300  # 5 minutes
    
    async def record_hit(self, cache_type: str, cache_key: str, response_time_ms: float):
        """Record cache hit"""
        await self._record_metric(cache_type, cache_key, 'hit', response_time_ms)
    
    async def record_miss(self, cache_type: str, cache_key: str, response_time_ms: float):
        """Record cache miss"""
        await self._record_metric(cache_type, cache_key, 'miss', response_time_ms)
    
    async def record_set_operation(self, cache_type: str, cache_key: str, response_time_ms: float, size_bytes: int):
        """Record cache set operation"""
        await self._record_metric(cache_type, cache_key, 'set', response_time_ms, size_bytes)
    
    async def _record_metric(
        self,
        cache_type: str,
        cache_key: str,
        operation: str,
        response_time_ms: float,
        size_bytes: Optional[int] = None
    ):
        """Record metric in buffer"""
        metric = {
            'cache_type': cache_type,
            'cache_key': cache_key,
            'operation': operation,
            'response_time_ms': response_time_ms,
            'size_bytes': size_bytes,
            'timestamp': datetime.utcnow()
        }
        
        self.metrics_buffer.append(metric)
        
        # Flush if buffer is full
        if len(self.metrics_buffer) >= self.buffer_size:
            await self._flush_metrics()
    
    async def _flush_metrics(self):
        """Flush metrics to database (placeholder for now)"""
        # In production, this would aggregate metrics and store in database
        logger.debug(f"Flushing {len(self.metrics_buffer)} cache metrics")
        self.metrics_buffer.clear()

# Global cache service instance
cache_service = CacheService(EventBus()) 