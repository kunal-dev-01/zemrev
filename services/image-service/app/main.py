# =====================================================
# MAIN APPLICATION
# =====================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import asyncio

from app.core.config import settings
from app.core.redis_client import redis_client
from app.services.format_checker import format_checker
from app.services.queue_worker import worker_manager
from app.api.routes.image_routes import router

# =====================================================
# LOGGING CONFIGURATION
# =====================================================

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# =====================================================
# APPLICATION LIFESPAN
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown
    
    Startup:
    - Connect to Redis
    - Check format support
    - Start queue workers
    
    Shutdown:
    - Stop queue workers
    - Disconnect from Redis
    """
    # =====================================================
    # STARTUP
    # =====================================================
    
    logger.info("🚀 Starting Image Converter API...")
    
    # Connect to Redis
    try:
        await redis_client.connect()
        logger.info("✅ Redis connected")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        if settings.RATE_LIMIT_ENABLED:
            logger.warning("⚠️  Rate limiting will not work!")
    
    # Check format support
    try:
        format_info = format_checker.check_all_formats()
        supported = format_info["output"]["supported"]
        unsupported = format_info["output"]["unsupported"]
        
        logger.info(f"📊 Supported formats: {', '.join(supported)}")
        
        if unsupported:
            logger.warning("⚠️  Unsupported formats:")
            for item in unsupported:
                logger.warning(f"  - {item['format']}: {item['error'][:80]}")
        
        # Update settings with actually supported formats
        settings.OUTPUT_FORMATS = supported
        
    except Exception as e:
        logger.error(f"❌ Format check failed: {e}")
        logger.warning("⚠️  Using default format list")
    
    # Start queue workers
    try:
        await worker_manager.start_workers(settings.QUEUE_MAX_WORKERS)
        logger.info(f"✅ Started {settings.QUEUE_MAX_WORKERS} queue workers")
    except Exception as e:
        logger.error(f"❌ Failed to start workers: {e}")
        logger.warning("⚠️  Queue processing disabled")
    
    logger.info("✅ Application startup complete")
    
    # =====================================================
    # APPLICATION RUNNING
    # =====================================================
    
    yield
    
    # =====================================================
    # SHUTDOWN
    # =====================================================
    
    logger.info("🔴 Shutting down...")
    
    # Stop queue workers
    try:
        await worker_manager.stop_workers()
        logger.info("✅ Queue workers stopped")
    except Exception as e:
        logger.error(f"❌ Error stopping workers: {e}")
    
    # Disconnect from Redis
    await redis_client.disconnect()
    
    logger.info("🔴 Shutdown complete")

# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="Image Converter API",
    description="Ultra-fast image conversion service powered by libvips with Redis queue",
    version="2.0.0",
    docs_url="/docs" if not settings.is_production() else None,
    redoc_url="/redoc" if not settings.is_production() else None,
    lifespan=lifespan
)

# =====================================================
# CORS MIDDLEWARE
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS", "DELETE"],
    allow_headers=["*"],
    max_age=3600
)

# =====================================================
# INCLUDE ROUTES
# =====================================================

app.include_router(router)

# =====================================================
# ROOT ENDPOINTS
# =====================================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Image Converter API",
        "version": "2.0.0",
        "status": "operational",
        "features": {
            "formats": f"{len(settings.OUTPUT_FORMATS)} output formats",
            "queue": "Redis-based job queue",
            "rate_limiting": "Enabled" if settings.RATE_LIMIT_ENABLED else "Disabled",
            "workers": settings.QUEUE_MAX_WORKERS
        },
        "endpoints": {
            "convert": "/api/v1/convert",
            "formats": "/api/v1/formats",
            "health": "/health",
            "queue_stats": "/api/v1/queue/stats"
        }
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    
    Returns service health status
    """
    try:
        redis_status = await redis_client.ping()
    except:
        redis_status = False
    
    from app.services.queue_manager import queue_manager
    queue_stats = await queue_manager.get_queue_stats()
    worker_stats = worker_manager.get_stats()
    
    is_healthy = redis_status and worker_stats["total_workers"] > 0
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "redis": "connected" if redis_status else "disconnected",
        "service": "image-converter",
        "queue": queue_stats,
        "workers": worker_stats,
        "supported_formats": len(settings.OUTPUT_FORMATS)
    }

# =====================================================
# ERROR HANDLERS
# =====================================================

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {exc}")
    return {
        "error": "Internal server error",
        "message": "Something went wrong. Please try again later."
    }

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return {
        "error": "Not found",
        "message": f"Endpoint {request.url.path} not found"
    }