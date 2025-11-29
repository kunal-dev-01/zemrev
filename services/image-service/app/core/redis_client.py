"""
============================================================================
FILE: app/core/redis_client.py
PURPOSE: Async Redis client with connection pooling
============================================================================
"""

import redis.asyncio as aioredis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    """Async Redis client"""
    
    def __init__(self):
        self.redis = None
        self.pool = None
    
    async def connect(self):
        """Establish Redis connection"""
        try:
            self.pool = aioredis.ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                decode_responses=True,
                encoding="utf-8"
            )
            
            self.redis = aioredis.Redis(connection_pool=self.pool)
            await self.redis.ping()
            
            logger.info("✅ Redis connected")
            
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
        if self.pool:
            await self.pool.disconnect()
        logger.info("Redis disconnected")
    
    async def ping(self) -> bool:
        """Check connection"""
        try:
            return await self.redis.ping()
        except:
            return False
    
    # Basic operations
    async def get(self, key: str):
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ex: int = None):
        return await self.redis.set(key, value, ex=ex)
    
    async def delete(self, key: str):
        return await self.redis.delete(key)
    
    async def incr(self, key: str):
        return await self.redis.incr(key)
    
    async def ttl(self, key: str):
        return await self.redis.ttl(key)
    
    # Queue operations
    async def lpush(self, key: str, *values):
        return await self.redis.lpush(key, *values)
    
    async def rpop(self, key: str):
        return await self.redis.rpop(key)
    
    async def llen(self, key: str):
        return await self.redis.llen(key)

redis_client = RedisClient()