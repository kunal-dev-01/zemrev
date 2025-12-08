"""
============================================================================
FILE: services/image-service/app/main.py
PURPOSE: Image Service FastAPI app (uses shared queue package)
============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings

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

    logger.info("🚀 Starting ZEMREV PDF Service...")

    # Startup tasks here (optional)

    yield   # <-- REQUIRED LINE

    # Shutdown tasks here (optional)

    logger.info("🔴 Shutting down PDF service...")

    

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ZEMREV Image API",
    description="Ultra-fast PDF Tools",
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

# app.include_router(router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

# ============================================================================
# HEALTH
# ============================================================================

@app.get("/")
async def root():
    """API info"""
    return {
        "service": "ZEMREV Image API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health():
    """Health check"""
    
    return {
        "status": "healthy",
        "workers": len(worker_manager.workers)
    }