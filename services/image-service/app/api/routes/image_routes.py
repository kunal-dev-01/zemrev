# ============================================================================
# FILE: app/api/routes/image_routes.py
# PURPOSE: FastAPI route definitions
# COMMIT: feat: add API routes for convert/compress/resize
# ============================================================================

from fastapi import APIRouter, UploadFile, File, Depends, Request, Form
from fastapi.responses import Response
from typing import List, Optional
from app.api.controllers.image_controller import ImageController
from app.core.rate_limiter import rate_limiter
from app.models.schemas import *

router = APIRouter(prefix="/api/v1", tags=["Image Tools"])

# Rate limit dependency
async def check_rate_limit(request: Request):
    await rate_limiter.check_rate_limit(request)

# ============================================================================
# CONVERT ENDPOINT
# ============================================================================

@router.post("/convert", response_class=Response)
async def convert(
    request: Request,
    files: Optional[List[UploadFile]] = File(None),
    format: OutputFormat = Form(OutputFormat.WEBP),
    quality: int = Form(85),
    url: Optional[str] = Form(None),
    _: None = Depends(check_rate_limit)
):
    """Convert image format"""
    
    options = ConvertRequest(
        format=format,
        quality=quality,
        url=url
    )
    
    return await ImageController.convert_images(files, options)

# ============================================================================
# COMPRESS ENDPOINT
# ============================================================================

@router.post("/compress", response_class=Response)
async def compress(
    request: Request,
    files: Optional[List[UploadFile]] = File(None),
    level: CompressionLevel = Form(CompressionLevel.MEDIUM),
    quality: Optional[int] = Form(None),
    keep_format: bool = Form(True),
    url: Optional[str] = Form(None),
    _: None = Depends(check_rate_limit)
):
    """Compress images"""
    
    options = CompressRequest(
        level=level,
        quality=quality,
        keep_format=keep_format,
        url=url
    )
    
    return await ImageController.compress_images(files, options)

# ============================================================================
# RESIZE ENDPOINT
# ============================================================================

@router.post("/resize", response_class=Response)
async def resize(
    request: Request,
    files: Optional[List[UploadFile]] = File(None),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    url: Optional[str] = Form(None),
    _: None = Depends(check_rate_limit)
):
    """Resize images"""
    
    options = ResizeRequest(
        width=width,
        height=height,
        url=url
    )
    
    return await ImageController.resize_images(files, options)

# ============================================================================
# FORMATS ENDPOINT
# ============================================================================

@router.get("/formats", response_model=FormatsResponse)
async def formats():
    """Get supported formats"""
    return await ImageController.get_formats()