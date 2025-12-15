"""
============================================================================
FILE: services/pdf-service/app/models/pymupdf_schemas.py
PURPOSE: Pydantic schemas for PyMuPDF tools
============================================================================
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class ImageFormat(str, Enum):
    """Supported image formats for PDF to Images"""
    PNG = "png"
    JPEG = "jpeg"
    JPG = "jpg"


class WatermarkPosition(str, Enum):
    """Watermark position presets"""
    CENTER = "center"
    TOP_LEFT = "top_left"
    TOP_RIGHT = "top_right"
    BOTTOM_LEFT = "bottom_left"
    BOTTOM_RIGHT = "bottom_right"


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class PdfToImagesRequest(BaseModel):
    """PDF to Images conversion request"""
    format: ImageFormat = Field(default=ImageFormat.PNG, description="Output image format")
    dpi: int = Field(default=150, ge=72, le=300, description="DPI for rendering (72-300)")
    page_range: Optional[str] = Field(None, description="Page range like '1-3,5' (optional, default: all)")
    
    @field_validator('page_range')
    @classmethod
    def validate_page_range(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        # Basic validation - detailed parsing in service
        if not v.strip():
            return None
        return v.strip()


class ImagesToPdfRequest(BaseModel):
    """Images to PDF conversion request"""
    # No additional fields needed - just file uploads
    pass


class ExtractTextRequest(BaseModel):
    """Extract text from PDF request"""
    page_range: Optional[str] = Field(None, description="Page range like '1-3,5' (optional, default: all)")
    preserve_layout: bool = Field(default=False, description="Preserve text layout")
    
    @field_validator('page_range')
    @classmethod
    def validate_page_range(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            return None
        return v.strip()


class ExtractImagesRequest(BaseModel):
    """Extract images from PDF request"""
    page_range: Optional[str] = Field(None, description="Page range like '1-3,5' (optional, default: all)")
    min_width: int = Field(default=100, ge=10, description="Minimum image width in pixels")
    min_height: int = Field(default=100, ge=10, description="Minimum image height in pixels")
    
    @field_validator('page_range')
    @classmethod
    def validate_page_range(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            return None
        return v.strip()


class AddWatermarkRequest(BaseModel):
    """Add watermark to PDF request - COORDINATE BASED"""
    text: Optional[str] = Field(None, description="Watermark text")
    opacity: float = Field(default=0.3, ge=0.1, le=1.0, description="Watermark opacity (0.1-1.0)")
    font_size: int = Field(default=50, ge=10, le=200, description="Text font size (10-200)")
    rotation: int = Field(default=45, ge=0, le=360, description="Watermark rotation (0-360)")
    color: str = Field(default="gray", description="Text color (e.g., 'red', 'blue', 'gray')")
    
    # NEW: Coordinate-based positioning
    x: int = Field(default=150, ge=0, le=1000, description="X position in PDF points")
    y: int = Field(default=350, ge=0, le=1500, description="Y position in PDF points")
    width: int = Field(default=300, ge=50, le=800, description="Width in PDF points")
    height: int = Field(default=150, ge=20, le=600, description="Height in PDF points")
    
    # REMOVED: position field (no longer needed)
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) == 0:
            raise ValueError("Watermark text cannot be empty")
        return v


class OptimizePdfRequest(BaseModel):
    """Optimize PDF request"""
    remove_metadata: bool = Field(default=True, description="Remove PDF metadata")
    remove_annotations: bool = Field(default=True, description="Remove annotations")
    remove_javascript: bool = Field(default=True, description="Remove JavaScript")
    remove_links: bool = Field(default=True, description="Remove hyperlinks")
    compress_images: bool = Field(default=False, description="Compress embedded images")

# ============================================================================
# SIGN PDF
# ============================================================================

class SignPdfRequest(BaseModel):
    """Sign PDF request"""
    signature_text: Optional[str] = Field(None, description="Text signature")
    x: int = Field(50, ge=0, description="X position")
    y: int = Field(50, ge=0, description="Y position")
    width: int = Field(200, ge=10, le=500, description="Signature width")
    height: int = Field(100, ge=10, le=300, description="Signature height")
    page: int = Field(0, ge=0, description="Page number (0-indexed)")


# ============================================================================
# CROP PDF
# ============================================================================

class CropPdfRequest(BaseModel):
    """Crop PDF request"""
    x: int = Field(..., ge=0, description="X position")
    y: int = Field(..., ge=0, description="Y position")
    width: int = Field(..., ge=10, description="Crop width")
    height: int = Field(..., ge=10, description="Crop height")    
    page_range: Optional[str] = Field(
       None,
       description="Page range like '1-3,5' (optional, default: all)"
    )

    @field_validator("page_range")
    @classmethod
    def validate_page_range(cls, v):
        if v is None or not v.strip():
            return None
        return v.strip()  


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class ExtractTextResponse(BaseModel):
    """Extract text response"""
    text: str
    page_count: int
    char_count: int


class ExtractImagesResponse(BaseModel):
    """Extract images response - returns ZIP of images"""
    image_count: int
    message: str


class OptimizePdfResponse(BaseModel):
    """Optimize PDF response"""
    message: str
    original_size_kb: float
    optimized_size_kb: float
    reduction_percent: float

  