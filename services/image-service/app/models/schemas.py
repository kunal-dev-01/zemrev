# ============================================================================
# FILE: app/models/schemas.py
# PURPOSE: Request/Response validation models
# COMMIT: feat: add comprehensive request/response schemas with URL support
# ============================================================================

from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Literal, Optional
from enum import Enum

# ============================================================================
# ENUMS FOR BETTER TYPE SAFETY
# ============================================================================

class OutputFormat(str, Enum):
    """Supported output formats (PyVips + Pillow combined)"""
    # PyVips优先格式 (最快)
    WEBP = "webp"
    AVIF = "avif"
    JPEG = "jpeg"
    JPG = "jpg"
    PNG = "png"
    TIFF = "tiff"
    
    # Pillow支持格式
    BMP = "bmp"
    GIF = "gif"
    ICO = "ico"
    PPM = "ppm"
    
    # 两者都支持
    TIF = "tif"

class CompressionLevel(str, Enum):
    """Compression presets"""
    LOW = "low"          # 快速，文件较大
    MEDIUM = "medium"    # 平衡
    HIGH = "high"        # 最佳压缩，较慢
    MAXIMUM = "maximum"  # 极限压缩

# ============================================================================
# CONVERSION REQUEST MODELS
# ============================================================================

class ConversionRequest(BaseModel):
    """Image conversion parameters"""
    
    format: OutputFormat = Field(
        default=OutputFormat.WEBP,
        description="Output image format"
    )
    
    quality: int = Field(
        default=85,
        ge=1,
        le=100,
        description="Output quality (1-100, ignored for PNG)"
    )
    
    width: Optional[int] = Field(
        default=None,
        ge=1,
        le=10000,
        description="Resize width (maintains aspect ratio)"
    )
    
    height: Optional[int] = Field(
        default=None,
        ge=1,
        le=10000,
        description="Resize height (maintains aspect ratio)"
    )
    
    url: Optional[HttpUrl] = Field(
        default=None,
        description="Image URL to download and convert"
    )

# ============================================================================
# COMPRESSION REQUEST MODELS
# ============================================================================

class CompressionRequest(BaseModel):
    """Image compression parameters"""
    
    level: CompressionLevel = Field(
        default=CompressionLevel.MEDIUM,
        description="Compression level preset"
    )
    
    quality: Optional[int] = Field(
        default=None,
        ge=1,
        le=100,
        description="Custom quality (overrides level preset)"
    )
    
    keep_format: bool = Field(
        default=True,
        description="Keep original format or convert to WebP"
    )
    
    width: Optional[int] = Field(
        default=None,
        ge=1,
        le=10000,
        description="Max width for compression"
    )
    
    height: Optional[int] = Field(
        default=None,
        ge=1,
        le=10000,
        description="Max height for compression"
    )
    
    url: Optional[HttpUrl] = Field(
        default=None,
        description="Image URL to compress"
    )

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class ConversionResponse(BaseModel):
    """Conversion result metadata"""
    
    filename: str
    original_size: int
    converted_size: int
    format: str
    compression_ratio: float
    processing_time: float
    engine_used: Literal["pyvips", "pillow"]
    message: str = "Conversion successful"

class CompressionResponse(BaseModel):
    """Compression result metadata"""
    
    filename: str
    original_size: int
    compressed_size: int
    format: str
    compression_ratio: float
    processing_time: float
    engine_used: Literal["pyvips", "pillow"]
    message: str = "Compression successful"

class ErrorResponse(BaseModel):
    """Error response format"""
    
    error: str
    detail: Optional[str] = None
    suggestion: Optional[str] = None

class FormatInfo(BaseModel):
    """Format capability information"""
    
    format: str
    supported_by: list[Literal["pyvips", "pillow"]]
    read: bool
    write: bool
    recommended_for: list[str]

class FormatsResponse(BaseModel):
    """All supported formats"""
    
    total_formats: int
    pyvips_formats: list[str]
    pillow_formats: list[str]
    combined_formats: list[str]
    details: list[FormatInfo]