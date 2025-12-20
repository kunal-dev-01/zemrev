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
from app.api.routes import ocr_routes

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
    
    logger.info("🚀 Starting ZEMREV OCR API...")
    logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"📊 Max file size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB")
    logger.info(f"📄 Max pages: {settings.MAX_PAGES}")
    
    yield
    
    logger.info("🔴 Shutting down OCR API...")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ZEMREV OCR API",
    description="Ultra-fast OCR processing with Tesseract",
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

app.include_router(ocr_routes.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API information"""
    return {
        "service": "ZEMREV OCR API",
        "version": "1.0.0",
        "status": "operational",
        "tools": {
            "ocr": [
                "pdf-to-searchable"
            ]
        }
    }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "pdf-service",
        "version": "1.0.0"
    }