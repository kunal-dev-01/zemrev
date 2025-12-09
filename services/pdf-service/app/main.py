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
from app.api.routes import pypdf_routes, pymupdf_routes, ghostscript_routes, libreoffice_routes, ocr_routes

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
app.include_router(pymupdf_routes.router)
app.include_router(ghostscript_routes.router)
app.include_router(libreoffice_routes.router)
app.include_router(ocr_routes.router)

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
        "tools": {
            "pypdf": ["merge", "split", "rotate", "encrypt", "decrypt"],
            "pymupdf": ["pdf-to-images", "images-to-pdf", "extract-text", "extract-images", "add-watermark", "optimize"],
            "ghostscript": ["compress", "flatten"],
            "libreoffice": ["word-to-pdf", "pdf-to-word", "html-to-pdf", "excel-to-pdf", "powerpoint-to-pdf"],
            "ocr": ["pdf-to-searchable", "extract-text"]
        },
        "endpoints": {
            "pypdf": {
                "merge": "/api/v1/pdf/merge",
                "split": "/api/v1/pdf/split",
                "rotate": "/api/v1/pdf/rotate",
                "encrypt": "/api/v1/pdf/encrypt",
                "decrypt": "/api/v1/pdf/decrypt"
            },
            "pymupdf": {
                "pdf_to_images": "/api/v1/pymupdf/pdf-to-images",
                "images_to_pdf": "/api/v1/pymupdf/images-to-pdf",
                "extract_text": "/api/v1/pymupdf/extract-text",
                "extract_images": "/api/v1/pymupdf/extract-images",
                "add_watermark": "/api/v1/pymupdf/add-watermark",
                "optimize": "/api/v1/pymupdf/optimize"
            },
            "ghostscript": {
                "compress": "/api/v1/ghostscript/compress",
                "flatten": "/api/v1/ghostscript/flatten"
            },
            "libreoffice": {
                "word_to_pdf": "/api/v1/libreoffice/word-to-pdf",
                "pdf_to_word": "/api/v1/libreoffice/pdf-to-word",
                "html_to_pdf": "/api/v1/libreoffice/html-to-pdf",
                "excel_to_pdf": "/api/v1/libreoffice/excel-to-pdf",
                "powerpoint_to_pdf": "/api/v1/libreoffice/powerpoint-to-pdf"
            },
            "ocr": {
                "pdf_to_searchable": "/api/v1/ocr/pdf-to-searchable",
                "extract_text": "/api/v1/ocr/extract-text"
            }
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