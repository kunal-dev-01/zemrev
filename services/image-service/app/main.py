"""
============================================================================
FILE: app/main.py
PURPOSE: FastAPI application with lifespan management
============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.redis_client import redis_client
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
    
    logger.info("🚀 Starting ZEMREV Image API...")
    
    # Connect Redis
    try:
        await redis_client.connect()
    except Exception as e:
        logger.error(f"❌ Redis failed: {e}")
    
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
    title="ZEMREV Image API",
    description="Ultra-fast PyVIPS-only image processing with HEIC support",
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
        "service": "ZEMREV Image API",
        "version": "1.0.0",
        "status": "operational",
        "engine": "PyVIPS (HEIC/HEIF supported)",
        "tools": [
            "convert",
            "compress",
            "resize",
            "optimize",
            "crop",
            "watermark"
        ],
        "endpoints": {
            "convert": "/api/v1/convert",
            "compress": "/api/v1/compress",
            "resize": "/api/v1/resize",
            "optimize": "/api/v1/optimize",
            "crop": "/api/v1/crop",
            "watermark_text": "/api/v1/watermark/text",
            "watermark_image": "/api/v1/watermark/image",
            "health": "/health",
            "docs": "/docs"
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