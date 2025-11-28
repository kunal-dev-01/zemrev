# ============================================================================
# FILE: app/models/schemas.py
# PURPOSE: Pydantic models for all API requests/responses
# COMMIT: feat: add schemas for converter, compressor, resizer with URL support
# ============================================================================

from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, Literal
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================

class OutputFormat(str, Enum):
    """All supported output formats"""
    # PyVips best
    WEBP = "webp"
    JPEG = "jpeg"
    JPG = "jpg"
    PNG = "png"
    TIFF = "tiff"
    AVIF = "avif"
    # Pillow best
    BMP = "bmp"
    GIF = "gif"
    ICO = "ico"
    PPM = "ppm"

class CompressionLevel(str, Enum):
    """Compression quality presets"""
    LOW = "low"          # Quality 90 - Fast
    MEDIUM = "medium"    # Quality 80 - Balanced
    HIGH = "high"        # Quality 70 - Better compression
    MAXIMUM = "maximum"  # Quality 60 - Max compression

# ============================================================================
# CONVERTER SCHEMAS
# ============================================================================

class ConvertRequest(BaseModel):
    """Image format conversion request"""
    format: OutputFormat = Field(default=OutputFormat.WEBP)
    quality: int = Field(default=85, ge=1, le=100)
    url: Optional[HttpUrl] = Field(default=None)

class ConvertResponse(BaseModel):
    """Conversion result"""
    filename: str
    original_size: int
    converted_size: int
    format: str
    compression_ratio: float
    processing_time: float
    engine_used: Literal["pyvips", "pillow"]

# ============================================================================
# COMPRESSOR SCHEMAS
# ============================================================================

class CompressRequest(BaseModel):
    """Image compression request"""
    level: CompressionLevel = Field(default=CompressionLevel.MEDIUM)
    quality: Optional[int] = Field(default=None, ge=1, le=100)
    keep_format: bool = Field(default=True)
    url: Optional[HttpUrl] = Field(default=None)

class CompressResponse(BaseModel):
    """Compression result"""
    filename: str
    original_size: int
    compressed_size: int
    format: str
    compression_ratio: float
    processing_time: float
    engine_used: Literal["pyvips", "pillow"]

# ============================================================================
# RESIZER SCHEMAS
# ============================================================================

class ResizeRequest(BaseModel):
    """Image resize request"""
    width: Optional[int] = Field(default=None, ge=1, le=10000)
    height: Optional[int] = Field(default=None, ge=1, le=10000)
    url: Optional[HttpUrl] = Field(default=None)
    
    @field_validator('width', 'height')
    def check_dimensions(cls, v, info):
        if info.field_name == 'height' and v is None:
            if info.data.get('width') is None:
                raise ValueError('At least one dimension required')
        return v

class ResizeResponse(BaseModel):
    """Resize result"""
    filename: str
    original_size: int
    resized_size: int
    original_dimensions: str
    new_dimensions: str
    processing_time: float
    engine_used: Literal["pyvips", "pillow"]

# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    redis: str
    queue: dict
    workers: int

class FormatsResponse(BaseModel):
    """Supported formats info"""
    pyvips_formats: list[str]
    pillow_formats: list[str]
    all_formats: list[str]
    total: int