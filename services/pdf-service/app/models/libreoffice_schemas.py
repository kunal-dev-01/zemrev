"""
============================================================================
FILE: app/models/libreoffice_schemas.py
PURPOSE: Pydantic schemas for LibreOffice tools
============================================================================
"""

from pydantic import BaseModel


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class ConvertToPdfRequest(BaseModel):
    """Convert document to PDF request - no additional parameters"""
    pass


class ConvertFromPdfRequest(BaseModel):
    """Convert PDF to document request - no additional parameters"""
    pass


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class ConversionResponse(BaseModel):
    """Conversion response"""
    message: str
    input_format: str
    output_format: str