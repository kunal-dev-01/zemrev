from pydantic import BaseModel, Field
from typing import Literal

class ConversionRequest(BaseModel):
    """Image conversion parameters"""
    
    format: Literal[
        "webp",
        "avif",
        "jpeg",
        "png",
        "tiff",
        "gif",
        "bmp",
        "heif",
        "ppm"
    ] = Field(
        default="webp",
        description="Output image format"
    )
    
    quality: int = Field(
        default=85,
        ge=1,
        le=100,
        description="Output quality (1-100). Ignored for PNG/GIF/PPM"
    )
    
    width: int | None = Field(
        default=None,
        ge=1,
        le=10000,
        description="Resize width in pixels (optional, maintains aspect ratio)"
    )
    
    height: int | None = Field(
        default=None,
        ge=1,
        le=10000,
        description="Resize height in pixels (optional, maintains aspect ratio)"
    )

class ConversionResponse(BaseModel):
    """Conversion result metadata"""
    
    filename: str = Field(description="Output filename")
    original_size: int = Field(description="Original file size in bytes")
    converted_size: int = Field(description="Converted file size in bytes")
    format: str = Field(description="Output format")
    compression_ratio: float = Field(description="Size reduction percentage")
    message: str = Field(default="Conversion successful")

class ErrorResponse(BaseModel):
    """Error response format"""
    
    error: str = Field(description="Error message")
    detail: str | None = Field(default=None, description="Additional error details")