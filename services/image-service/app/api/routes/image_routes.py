"""
============================================================================
FILE: app/api/routes/image_routes.py
PURPOSE: FastAPI route definitions
============================================================================
"""

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
from typing import Optional
from app.api.controllers.image_controller import image_controller
from app.models.schemas import *

router = APIRouter(prefix="/api/v1/image", tags=["Image Tools"])

# ============================================================================
# CONVERT
# ============================================================================

@router.post("/convert", response_class=Response)
async def convert(
    file: Optional[UploadFile] = File(None),
    format: OutputFormat = Form(OutputFormat.WEBP),
    quality: int = Form(75),
    url: Optional[str] = Form(None)
):
    """Convert image format"""
    
    options = ConvertRequest(format=format, quality=quality, url=url)
    return await image_controller.convert_image(file, options)

# ============================================================================
# COMPRESS
# ============================================================================

@router.post("/compress", response_class=Response)
async def compress(
    file: Optional[UploadFile] = File(None),
    quality: int = Form(75),
    format: Optional[OutputFormat] = Form(None),
    url: Optional[str] = Form(None)
):
    """Compress image"""
    
    options = CompressRequest(quality=quality, format=format, url=url)
    return await image_controller.compress_image(file, options)

# ============================================================================
# RESIZE
# ============================================================================

@router.post("/resize", response_class=Response)
async def resize(
    file: Optional[UploadFile] = File(None),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    mode: ResizeMode = Form(ResizeMode.CONTAIN),
    format: Optional[OutputFormat] = Form(None),
    url: Optional[str] = Form(None)
):
    """Resize image"""
    
    options = ResizeRequest(
        width=width,
        height=height,
        mode=mode,
        format=format,
        url=url
    )
    return await image_controller.resize_image(file, options)

# ============================================================================
# OPTIMIZE
# ============================================================================

@router.post("/optimize", response_class=Response)
async def optimize(
    file: Optional[UploadFile] = File(None),
    strip_exif: bool = Form(True),
    strip_gps: bool = Form(True),
    fix_orientation: bool = Form(True),
    url: Optional[str] = Form(None)
):
    """Optimize image"""
    
    options = OptimizeRequest(
        strip_exif=strip_exif,
        strip_gps=strip_gps,
        fix_orientation=fix_orientation,
        url=url
    )
    return await image_controller.optimize_image(file, options)

# ============================================================================
# CROP
# ============================================================================

@router.post("/crop", response_class=Response)
async def crop(
    file: Optional[UploadFile] = File(None),
    x: int = Form(...),
    y: int = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    format: Optional[OutputFormat] = Form(None),
    url: Optional[str] = Form(None)
):
    """Crop image"""
    
    options = CropRequest(
        x=x, y=y, width=width, height=height, format=format, url=url
    )
    return await image_controller.crop_image(file, options)

# ============================================================================
# WATERMARK TEXT
# ============================================================================

@router.post("/watermark/text", response_class=Response)
async def watermark_text(
    file: Optional[UploadFile] = File(None),
    text: str = Form(...),
    font_size: int = Form(48),
    color: str = Form("#FFFFFF"),
    opacity: float = Form(0.5),
    position: WatermarkPosition = Form(WatermarkPosition.BOTTOM_RIGHT),
    url: Optional[str] = Form(None)
):
    """Add text watermark"""
    
    options = TextWatermarkRequest(
        text=text,
        font_size=font_size,
        color=color,
        opacity=opacity,
        position=position,
        url=url
    )
    return await image_controller.add_text_watermark(file, options)

# ============================================================================
# WATERMARK IMAGE
# ============================================================================

@router.post("/watermark/image", response_class=Response)
async def watermark_image(
    file: Optional[UploadFile] = File(None),
    watermark: UploadFile = File(...),
    scale: float = Form(0.2),
    opacity: float = Form(0.5),
    position: WatermarkPosition = Form(WatermarkPosition.BOTTOM_RIGHT),
    url: Optional[str] = Form(None)
):
    """Add image watermark"""
    
    options = ImageWatermarkRequest(
        scale=scale,
        opacity=opacity,
        position=position,
        url=url
    )
    return await image_controller.add_image_watermark(file, watermark, options)


# ============================================================================
# IMAGE FILTER
# ============================================================================


@router.post("/metadata")
async def extract_metadata(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None)
):
    """Extract image metadata (EXIF, properties, technical info)"""
    
    options = MetadataRequest(url=url)
    return await image_controller.extract_metadata(file, options)


# ============================================================================
# COLOR PALETTE
# ============================================================================

@router.post("/palette")
async def extract_palette(
    file: Optional[UploadFile] = File(None),
    num_colors: int = Form(5),
    url: Optional[str] = Form(None)
):
    """Extract color palette"""
    
    options = PaletteRequest(num_colors=num_colors, url=url)
    return await image_controller.extract_palette(file, options)    