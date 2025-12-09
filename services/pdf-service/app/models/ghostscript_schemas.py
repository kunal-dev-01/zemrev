"""
============================================================================
FILE: app/models/ghostscript_schemas.py
PURPOSE: Pydantic schemas for Ghostscript tools
============================================================================
"""

from pydantic import BaseModel, Field
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class CompressionLevel(str, Enum):
    """PDF compression levels"""
    SCREEN = "screen"      # Low quality, smallest size (72 DPI)
    EBOOK = "ebook"        # Medium quality (150 DPI)
    PRINTER = "printer"    # High quality (300 DPI)
    PREPRESS = "prepress"  # Very high quality (300 DPI, color preserving)


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class CompressPdfRequest(BaseModel):
    """Compress PDF request"""
    level: CompressionLevel = Field(
        default=CompressionLevel.EBOOK,
        description="Compression level (screen/ebook/printer/prepress)"
    )


class FlattenPdfRequest(BaseModel):
    """Flatten PDF request - no parameters needed"""
    pass


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class CompressPdfResponse(BaseModel):
    """Compress PDF response"""
    original_size_kb: float
    compressed_size_kb: float
    reduction_percent: float
    compression_level: str