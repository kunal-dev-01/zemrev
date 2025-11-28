# ============================================================================
# FILE: app/core/rate_limiter.py
# PURPOSE: IP-based rate limiting with auto-expiring keys
# COMMIT: feat: add Redis-based rate limiter with automatic cleanup
# ============================================================================

from fastapi import HTTPException, Request
from app.core.redis_client import redis_client
from app.core.config import settings
import hashlib

class RateLimiter:
    """Rate limiter with auto-expiring Redis keys"""
    
    @staticmethod
    async def check_rate_limit(request: Request):
        """Check if request exceeds rate limit"""
        
        if not settings.RATE_LIMIT_ENABLED:
            return
        
        # Get IP address
        ip = request.client.host
        if "x-forwarded-for" in request.headers:
            ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Hash IP for privacy
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:16]
        key = f"rate:{ip_hash}"
        
        # Get current count
        current = await redis_client.get(key)
        
        if current is None:
            # First request - set counter with expiration
            await redis_client.set(
                key, 
                "1", 
                ex=settings.RATE_LIMIT_WINDOW
            )
            return
        
        current = int(current)
        
        # Check limit
        if current >= settings.RATE_LIMIT_REQUESTS:
            ttl = await redis_client.ttl(key)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "retry_after": ttl
                }
            )
        
        # Increment counter
        await redis_client.incr(key)

# Global instance
rate_limiter = RateLimiter()