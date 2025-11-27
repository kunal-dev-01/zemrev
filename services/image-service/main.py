from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.redis_client import redis_client
from app.api.routes import router
import logging

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    try:
        await redis_client.connect()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
    
    yield
    
    # Shutdown
    await redis_client.disconnect()
    logger.info("🔴 Application shutdown complete")

app = FastAPI(
    title="Image Converter API",
    description="Ultra-fast image conversion service with zero storage",
    version="1.0.0",
    docs_url="/docs" if settings.LOG_LEVEL == "debug" else None,
    redoc_url=None,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if settings.ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600
)

# Include API routes
app.include_router(router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Image Converter API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "convert": "/api/v1/convert",
            "formats": "/api/v1/formats",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        redis_status = await redis_client.ping()
        return {
            "status": "healthy",
            "redis": "connected" if redis_status else "disconnected",
            "service": "image-converter"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "redis": "error",
            "error": str(e)
        }