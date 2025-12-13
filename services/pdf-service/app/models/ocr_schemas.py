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



# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class OcrResponse(BaseModel):
    """OCR response"""
    message: str
    pages_processed: int
    language: str
