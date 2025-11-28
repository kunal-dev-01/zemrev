# ============================================================================
# FILE: app/main.py
# PURPOSE: FastAPI application with lifespan management
# COMMIT: feat: add FastAPI app with Redis/workers lifecycle
# ============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.redis_client import redis_client
from app.services.format_detector import format_detector
from app.services.queue_worker import worker_manager
from app.api.routes.image_routes import router

# ============================================================================
# LOGGING
# ============================================================================

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============================================================================
# LIFESPAN
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    
    # ========================================================================
    # STARTUP
    # ========================================================================
    
    logger.info("🚀 Starting Image Converter API...")
    
    # Connect Redis
    try:
        await redis_client.connect()
    except Exception as e:
        logger.error(f"❌ Redis failed: {e}")
    
    # Detect formats
    try:
        format_detector.detect_all()
    except Exception as e:
        logger.error(f"❌ Format detection failed: {e}")
    
    # Start workers
    try:
        await worker_manager.start_workers(settings.QUEUE_MAX_WORKERS)
    except Exception as e:
        logger.error(f"❌ Workers failed: {e}")
    
    logger.info("✅ Startup complete")
    
    yield
    
    # ========================================================================
    # SHUTDOWN
    # ========================================================================
    
    logger.info("🔴 Shutting down...")
    
    # Stop workers
    try:
        await worker_manager.stop_workers()
    except Exception as e:
        logger.error(f"❌ Worker shutdown error: {e}")
    
    # Disconnect Redis
    await redis_client.disconnect()
    
    logger.info("🔴 Shutdown complete")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="Image Converter API",
    description="Ultra-fast image converter with PyVips + Pillow",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================================================
# CORS
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600
)

# ============================================================================
# ROUTES
# ============================================================================

app.include_router(router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API info"""
    return {
        "service": "Image Converter API",
        "version": "1.0.0",
        "status": "operational",
        "tools": ["converter", "compressor", "resizer"],
        "endpoints": {
            "convert": "/api/v1/convert",
            "compress": "/api/v1/compress",
            "resize": "/api/v1/resize",
            "formats": "/api/v1/formats",
            "health": "/health"
        }
    }

@app.get("/health")
async def health():
    """Health check"""
    
    try:
        redis_status = await redis_client.ping()
    except:
        redis_status = False
    
    from app.services.queue_manager import queue_manager
    queue_size = await queue_manager.get_queue_size()
    
    return {
        "status": "healthy" if redis_status else "degraded",
        "redis": "connected" if redis_status else "disconnected",
        "queue_size": queue_size,
        "workers": len(worker_manager.workers)
    }