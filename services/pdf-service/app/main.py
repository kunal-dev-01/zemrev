"""
============================================================================
FILE: services/pdf-service/app/main.py
PURPOSE: PDF Service FastAPI app
============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.routes import pypdf_routes

# ============================================================================
# SETUP LOGGING
# ============================================================================

setup_logging()
logger = get_logger(__name__)

# ============================================================================
# LIFESPAN
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    
    logger.info("🚀 Starting ZEMREV PDF Service...")
    logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"📊 Max file size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB")
    logger.info(f"📄 Max pages: {settings.MAX_PAGES}")
    
    yield
    
    logger.info("🔴 Shutting down PDF service...")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ZEMREV PDF API",
    description="Ultra-fast PDF Tools - Merge, Split, Rotate, Encrypt, Decrypt",
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

app.include_router(pypdf_routes.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API information"""
    return {
        "service": "ZEMREV PDF API",
        "version": "1.0.0",
        "status": "operational",
        "tools": [
            "merge",
            "split",
            "rotate",
            "encrypt",
            "decrypt"
        ],
        "endpoints": {
            "merge": "/api/v1/pdf/merge",
            "split": "/api/v1/pdf/split",
            "rotate": "/api/v1/pdf/rotate",
            "encrypt": "/api/v1/pdf/encrypt",
            "decrypt": "/api/v1/pdf/decrypt"
        }
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "pdf-service",
        "version": "1.0.0"
    }