"""
============================================================================
FILE: services/pdf-service/app/main.py
PURPOSE: PDF Service FastAPI app (uses shared queue package)
============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.routes import ghostscript_routes
from app.services.queue_worker import worker_manager

# Import shared queue package
from zemrev_queue import redis_client

# ============================================================================
# LOGGING
# ============================================================================

setup_logging()
logger = get_logger(__name__)

# ============================================================================
# LIFESPAN
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    
    logger.info("🚀 Starting ZEMREV PDF Service...")
    logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"⏱️  Queue timeout: {settings.QUEUE_JOB_TIMEOUT}s")
    logger.info(f"👷 Max workers: {settings.QUEUE_MAX_WORKERS}")
    
    # Tool limits
    logger.info(f"🔧 COMPRESS - Max: {settings.COMPRESS_MAX_FILE_SIZE / (1024*1024):.0f}MB, {settings.COMPRESS_MAX_PAGES} pages, {settings.COMPRESS_TIMEOUT}s timeout")
    logger.info(f"🔧 FLATTEN - Max: {settings.FLATTEN_MAX_FILE_SIZE / (1024*1024):.0f}MB, {settings.FLATTEN_MAX_PAGES} pages, {settings.FLATTEN_TIMEOUT}s timeout")
    logger.info(f"🔧 PDFA - Max: {settings.PDFA_MAX_FILE_SIZE / (1024*1024):.0f}MB, {settings.PDFA_MAX_PAGES} pages, {settings.PDFA_TIMEOUT}s timeout")
    
    # Connect to shared Redis queue
    try:
        await redis_client.connect()
        logger.info("✅ Redis connected")
    except Exception as e:
        logger.error(f"❌ Redis failed: {e}")
        raise
    
    # Start workers
    try:
        await worker_manager.start_workers(settings.QUEUE_MAX_WORKERS)
        logger.info(f"✅ {settings.QUEUE_MAX_WORKERS} workers started")
    except Exception as e:
        logger.error(f"❌ Workers failed: {e}")
        raise
    
    logger.info("✅ PDF Service ready")
    
    yield
    
    # Shutdown
    logger.info("🔴 Shutting down...")
    
    try:
        await worker_manager.stop_workers()
    except Exception as e:
        logger.error(f"❌ Worker shutdown error: {e}")
    
    await redis_client.disconnect()
    
    logger.info("🔴 Shutdown complete")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ZEMREV PDF API",
    description="Ultra-fast PDF processing with Ghostscript + Queue",
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

app.include_router(ghostscript_routes.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API info"""
    return {
        "service": "ZEMREV PDF API",
        "version": "1.0.0",
        "status": "operational",
        "engine": "Ghostscript",
        "tools": [
            "compress",
            "flatten",
            "convert-pdfa"
        ]
    }

@app.get("/health")
async def health():
    """Health check"""
    
    try:
        redis_status = await redis_client.ping()
    except:
        redis_status = False
    
    from zemrev_queue import queue_manager
    queue_size = await queue_manager.get_queue_size()
    
    return {
        "status": "healthy" if redis_status else "degraded",
        "redis": "connected" if redis_status else "disconnected",
        "queue_size": queue_size,
        "workers": len(worker_manager.workers)
    }