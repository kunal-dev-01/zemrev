from fastapi import HTTPException, Request
from app.core.redis_client import redis_client
from app.core.config import settings
import hashlib
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Token bucket rate limiter using Redis
    Prevents abuse while allowing burst traffic
    """
    
    @staticmethod
    async def check_rate_limit(request: Request):
        """
        Check if client has exceeded rate limit
        Uses sliding window counter in Redis
        """
        # Get client IP (handle proxies)
        client_ip = request.client.host
        if "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Create hashed key for privacy
        ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()[:16]
        key = f"rate_limit:{ip_hash}"
        
        try:
            # Get current request count
            current = await redis_client.get(key)
            
            if current is None:
                # First request in window
                await redis_client.set(key, "1", ex=settings.RATE_LIMIT_WINDOW)
                logger.debug(f"Rate limit initialized for {ip_hash}")
                return
            
            current = int(current)
            
            # Check if limit exceeded
            if current >= settings.RATE_LIMIT_REQUESTS:
                ttl = await redis_client.ttl(key)
                logger.warning(f"Rate limit exceeded for {ip_hash}")
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "retry_after": ttl,
                        "limit": settings.RATE_LIMIT_REQUESTS,
                        "window": settings.RATE_LIMIT_WINDOW
                    }
                )
            
            # Increment counter
            await redis_client.incr(key)
            logger.debug(f"Request count for {ip_hash}: {current + 1}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Fail open - allow request if Redis fails
            pass

rate_limiter = RateLimiter()