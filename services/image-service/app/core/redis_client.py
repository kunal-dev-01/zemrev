# =====================================================
# REDIS CLIENT
# =====================================================

import redis.asyncio as aioredis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# =====================================================
# REDIS CLIENT CLASS
# =====================================================
class RedisClient:
    """Async Redis client with connection pooling"""
    
    def __init__(self):
        self.redis = None
        self.pool = None
    
    # =====================================================
    # CONNECTION MANAGEMENT
    # =====================================================
    
    async def connect(self):
        """Establish Redis connection with pool"""
        try:
            # Create connection pool
            self.pool = aioredis.ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                socket_keepalive=settings.REDIS_SOCKET_KEEPALIVE,
                decode_responses=True,
                encoding="utf-8"
            )
            
            # Create Redis client
            self.redis = aioredis.Redis(connection_pool=self.pool)
            
            # Test connection
            await self.redis.ping()
            
            logger.info("✅ Redis connected successfully")
            
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close Redis connection gracefully"""
        if self.redis:
            await self.redis.close()
        if self.pool:
            await self.pool.disconnect()
        logger.info("Redis connection closed")
    
    async def ping(self) -> bool:
        """Check Redis connection health"""
        try:
            return await self.redis.ping()
        except:
            return False
    
    # =====================================================
    # BASIC OPERATIONS
    # =====================================================
    
    async def get(self, key: str):
        """Get value from Redis"""
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ex: int = None):
        """Set value in Redis with optional expiration"""
        return await self.redis.set(key, value, ex=ex)
    
    async def delete(self, key: str):
        """Delete key from Redis"""
        return await self.redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        return await self.redis.exists(key) > 0
    
    # =====================================================
    # COUNTER OPERATIONS (for rate limiting)
    # =====================================================
    
    async def incr(self, key: str):
        """Increment counter atomically"""
        return await self.redis.incr(key)
    
    async def expire(self, key: str, seconds: int):
        """Set expiration time on key"""
        return await self.redis.expire(key, seconds)
    
    async def ttl(self, key: str):
        """Get remaining time to live for key"""
        return await self.redis.ttl(key)
    
    # =====================================================
    # QUEUE OPERATIONS
    # =====================================================
    
    async def zadd(self, key: str, mapping: dict):
        """Add to sorted set (for priority queue)"""
        return await self.redis.zadd(key, mapping)
    
    async def zpopmax(self, key: str, count: int = 1):
        """Pop highest priority item from sorted set"""
        return await self.redis.zpopmax(key, count)
    
    async def zcard(self, key: str):
        """Get sorted set size"""
        return await self.redis.zcard(key)
    
    async def sadd(self, key: str, *values):
        """Add to set"""
        return await self.redis.sadd(key, *values)
    
    async def srem(self, key: str, *values):
        """Remove from set"""
        return await self.redis.srem(key, *values)
    
    async def scard(self, key: str):
        """Get set size"""
        return await self.redis.scard(key)
    
    async def smembers(self, key: str):
        """Get all set members"""
        return await self.redis.smembers(key)
    
    # =====================================================
    # UTILITY OPERATIONS
    # =====================================================
    
    async def keys(self, pattern: str):
        """Get keys matching pattern (use carefully!)"""
        return await self.redis.keys(pattern)
    
    async def flushdb(self):
        """Flush current database (emergency only!)"""
        return await self.redis.flushdb()
    
    async def info(self, section: str = "server"):
        """Get Redis server info"""
        return await self.redis.info(section)

# =====================================================
# GLOBAL REDIS CLIENT INSTANCE
# =====================================================
redis_client = RedisClient()