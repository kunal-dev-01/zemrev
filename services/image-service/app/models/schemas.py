"""
============================================================================
FILE: app/models/schemas.py
PURPOSE: Pydantic models for API requests/responses
============================================================================
"""

from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, Literal
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================

class OutputFormat(str, Enum):
    """Supported output formats (PyVips only)"""
    JPEG = "jpeg"
    JPG = "jpg"
    PNG = "png"
    WEBP = "webp"
    AVIF = "avif"
    TIFF = "tiff"
    GIF = "gif"
    BMP = "bmp"
    HEIC = "heic"
    HEIF = "heif"

class ResizeMode(str, Enum):
    """Resize modes"""
    CONTAIN = "contain"       # Fit inside, maintain aspect
    COVER = "cover"           # Fill area, crop excess
    STRETCH = "stretch"       # Force exact dimensions
    EXACT = "exact"           # Exact width/height

class WatermarkPosition(str, Enum):
    """Watermark positions"""
    TOP_LEFT = "top-left"
    TOP_RIGHT = "top-right"
    BOTTOM_LEFT = "bottom-left"
    BOTTOM_RIGHT = "bottom-right"
    CENTER = "center"

# ============================================================================
# CONVERTER
# ============================================================================

class ConvertRequest(BaseModel):
    """Image format conversion"""
    format: OutputFormat = Field(default=OutputFormat.WEBP)
    quality: int = Field(default=75, ge=1, le=100)
    url: Optional[HttpUrl] = Field(default=None)

# ============================================================================
# COMPRESSOR
# ============================================================================

class CompressRequest(BaseModel):
    """Image compression"""
    quality: int = Field(default=75, ge=1, le=100)
    format: Optional[OutputFormat] = Field(default=None)
    url: Optional[HttpUrl] = Field(default=None)

# ============================================================================
# RESIZER
# ============================================================================

class ResizeRequest(BaseModel):
    """Image resize"""
    width: Optional[int] = Field(default=None, ge=1, le=15000)
    height: Optional[int] = Field(default=None, ge=1, le=15000)
    mode: ResizeMode = Field(default=ResizeMode.CONTAIN)
    format: Optional[OutputFormat] = Field(default=None)
    url: Optional[HttpUrl] = Field(default=None)
    
    @field_validator('width', 'height')
    def check_dimensions(cls, v, info):
        if info.field_name == 'height' and v is None:
            if info.data.get('width') is None:
                raise ValueError('At least width or height required')
        return v

# ============================================================================
# OPTIMIZER
# ============================================================================

class OptimizeRequest(BaseModel):
    """Image optimization"""
    strip_exif: bool = Field(default=True)
    strip_gps: bool = Field(default=True)
    fix_orientation: bool = Field(default=True)
    url: Optional[HttpUrl] = Field(default=None)

# ============================================================================
# CROPPER
# ============================================================================

class CropRequest(BaseModel):
    """Image cropping"""
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(ge=1, le=15000)
    height: int = Field(ge=1, le=15000)
    format: Optional[OutputFormat] = Field(default=None)
    url: Optional[HttpUrl] = Field(default=None)

# ============================================================================
# WATERMARK
# ============================================================================

class TextWatermarkRequest(BaseModel):
    """Text watermark"""
    text: str = Field(max_length=200)
    font_size: int = Field(default=48, ge=10, le=200)
    color: str = Field(default="#FFFFFF")
    opacity: float = Field(default=0.5, ge=0.0, le=1.0)
    position: WatermarkPosition = Field(default=WatermarkPosition.BOTTOM_RIGHT)
    url: Optional[HttpUrl] = Field(default=None)

class ImageWatermarkRequest(BaseModel):
    """Image watermark"""
    scale: float = Field(default=0.2, ge=0.01, le=1.0)
    opacity: float = Field(default=0.5, ge=0.0, le=1.0)
    position: WatermarkPosition = Field(default=WatermarkPosition.BOTTOM_RIGHT)
    url: Optional[HttpUrl] = Field(default=None)

# ============================================================================
# RESPONSES
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check"""
    status: str
    redis: str
    queue_size: int
    workers: int