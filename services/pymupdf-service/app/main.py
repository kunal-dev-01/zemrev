from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.routes import pymupdf_routes

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
    
    logger.info("🚀 Starting ZEMREV PYMUPDF API...")
    logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"📊 Max file size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB")
    logger.info(f"📄 Max pages: {settings.MAX_PAGES}")
    
    yield
    
    logger.info("🔴 Shutting down PYMUPDF API...")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="ZEMREV PYMUPDF API",
    description="PYMUPDF PDF Service",
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

app.include_router(pymupdf_routes.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "service": "ZEMREV PYMUPDF API",
        "version": "1.0.0",
        "status": "operational",
        "tools": {
            "pymupdf": [
                "pdf-to-images", "images-to-pdf", "extract-text", "extract-images", 
                "add-watermark", "optimize", "sign", "crop"
            ]
        }
    }

# ============================================================================
# HEALTH ENDPOINTS
# ============================================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "PYMUPDF API",
        "version": "1.0.0"
    }