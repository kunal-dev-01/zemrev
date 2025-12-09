"""
============================================================================
FILE: services/pdf-service/app/api/routes/ghostscript_routes.py
PURPOSE: API routes for Ghostscript operations
============================================================================
"""

from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import FileResponse

from app.api.controllers.ghostscript_controller import (
    compress_pdf_handler,
    flatten_pdf_handler
)
from app.models.ghostscript_schemas import (
    CompressPdfRequest, FlattenPdfRequest, CompressionLevel
)

router = APIRouter(prefix="/api/v1/ghostscript", tags=["Ghostscript Tools"])


@router.post("/compress", response_class=FileResponse)
async def compress_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to compress"),
    level: CompressionLevel = Form(
        default=CompressionLevel.EBOOK,
        description="Compression level (screen/ebook/printer/prepress)"
    )
) -> FileResponse:
    """
    Ultra PDF compression using Ghostscript.
    
    **Request:**
    - file: PDF file
    - level: Compression level
      - **screen**: 72 DPI (smallest, lowest quality)
      - **ebook**: 150 DPI (medium quality, recommended)
      - **printer**: 300 DPI (high quality)
      - **prepress**: 300 DPI (very high quality, color preserving)
    
    **Response:**
    - Compressed PDF file
    
    **Note:** Real file size reduction! Can reduce 10MB PDFs to 1-2MB.
    """
    request = CompressPdfRequest(level=level)
    return await compress_pdf_handler(file, request)


@router.post("/flatten", response_class=FileResponse)
async def flatten_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to flatten")
) -> FileResponse:
    """
    Flatten PDF - remove layers, transparency, and forms.
    
    **Request:**
    - file: PDF file
    
    **Response:**
    - Flattened PDF file (all content converted to static)
    
    **What it does:**
    - Removes all layers
    - Flattens transparency
    - Removes form fields
    - Removes annotations
    - Converts to static content
    
    **Use cases:**
    - Prepare PDFs for printing
    - Remove editable forms
    - Fix transparency issues
    - Simplify complex PDFs
    """
    request = FlattenPdfRequest()
    return await flatten_pdf_handler(file, request)