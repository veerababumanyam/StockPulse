"""
Redis initialization and configuration.
"""
import redis.asyncio as aioredis

from app.core.config import get_settings

settings = get_settings()

# Redis connection pool
redis_pool = None


async def init_redis():
    """Initialize Redis connection pool."""
    global redis_pool
    redis_pool = aioredis.ConnectionPool.from_url(
        settings.redis_url, decode_responses=True
    )


async def get_redis():
    """Get Redis connection."""
    return aioredis.Redis(connection_pool=redis_pool)
