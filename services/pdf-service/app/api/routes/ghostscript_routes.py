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

    request = CompressPdfRequest(level=level)
    return await compress_pdf_handler(file, request)


@router.post("/flatten", response_class=FileResponse)
async def flatten_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to flatten")
) -> FileResponse:

    request = FlattenPdfRequest()
    return await flatten_pdf_handler(file, request)

@router.post("/convert-pdfa", response_class=FileResponse)
async def convert_to_pdfa_endpoint(
    file: UploadFile = File(..., description="PDF file to convert to PDF/A"),
    version: str = Form("2b", description="PDF/A version: 1b, 2b, or 3b")
) -> FileResponse:
    """
    Convert a PDF to PDF/A format (archival standard).
    
    PDF/A versions:
    - 1b: Basic conformance (ISO 19005-1)
    - 2b: Enhanced features (ISO 19005-2) - Recommended
    - 3b: Latest standard (ISO 19005-3)
    """
    request = ConvertToPdfARequest(version=version)
    return await convert_to_pdfa_handler(file, request)