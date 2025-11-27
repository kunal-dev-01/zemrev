# Redis rate limiter

from fastapi import HTTPException
from app.core.redis_client import redis_client
from app.core.config import settings
import hashlib

class RateLimiter:
    @staticmethod
    async def check_rate_limit(request):
        ip = request.client.host
        if "x-forwarded-for" in request.headers:
            ip = request.headers["x-forwarded-for"].split(",")[0].strip()

        key = f"rate:{hashlib.sha256(ip.encode()).hexdigest()[:16]}"

        current = await redis_client.get(key)

        if current is None:
            await redis_client.set(key, "1", ex=settings.RATE_LIMIT_WINDOW)
            return

        current = int(current)

        if current >= settings.RATE_LIMIT_REQUESTS:
            ttl = await redis_client.ttl(key)
            raise HTTPException(429, {
                "error": "Rate limit exceeded",
                "retry_after": ttl
            })

        await redis_client.incr(key)

rate_limiter = RateLimiter()
