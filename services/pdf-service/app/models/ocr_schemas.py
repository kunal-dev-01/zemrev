"""
============================================================================
FILE: app/models/ocr_schemas.py
PURPOSE: Pydantic schemas for OCR tools
============================================================================
"""

from pydantic import BaseModel, Field
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class OcrPdfRequest(BaseModel):
    """OCR PDF request"""
    language: str = Field(
        default="eng",
        description="OCR language code (eng, fra, deu, spa, etc.)"
    )
    dpi: int = Field(
        default=300,
        ge=150,
        le=600,
        description="DPI for OCR processing (150-600)"
    )


class ExtractTextOcrRequest(BaseModel):
    """Extract text from scanned PDF with OCR"""
    language: str = Field(
        default="eng",
        description="OCR language code (eng, fra, deu, spa, etc.)"
    )
    page_range: Optional[str] = Field(
        None,
        description="Page range like '1-3,5' (optional, default: all)"
    )


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class OcrResponse(BaseModel):
    """OCR response"""
    message: str
    pages_processed: int
    language: str


class ExtractTextOcrResponse(BaseModel):
    """Extract text OCR response"""
    text: str
    pages_processed: int
    char_count: int
    language: str