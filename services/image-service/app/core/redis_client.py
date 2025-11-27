# app/core/redis_client.py

import redis.asyncio as aioredis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    """Async Redis client for rate limiting and queue management"""
    
    def __init__(self):
        self.redis = None
    
    async def connect(self):
        """Establish Redis connection"""
        try:
            self.redis = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True
            )
            await self.redis.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            logger.info("Redis connection closed")
    
    async def ping(self) -> bool:
        """Check Redis connection health"""
        try:
            return await self.redis.ping()
        except:
            return False
    
    async def get(self, key: str):
        """Get value from Redis"""
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ex: int = None):
        """Set value in Redis with optional expiration (seconds)"""
        return await self.redis.set(key, value, ex=ex)
    
    async def incr(self, key: str):
        """Increment counter atomically"""
        return await self.redis.incr(key)
    
    async def expire(self, key: str, seconds: int):
        """Set expiration time on key"""
        return await self.redis.expire(key, seconds)
    
    async def ttl(self, key: str):
        """Get remaining time to live for key"""
        return await self.redis.ttl(key)
    
    async def delete(self, key: str):
        """Delete key from Redis"""
        return await self.redis.delete(key)

# Global Redis client instance
redis_client = RedisClient()