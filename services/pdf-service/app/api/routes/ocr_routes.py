"""
============================================================================
FILE: services/pdf-service/app/api/routes/ocr_routes.py
PURPOSE: API routes for OCR operations
============================================================================
"""

from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import FileResponse
from typing import Optional

from app.api.controllers.ocr_controller import (
    ocr_pdf_handler,
    extract_text_ocr_handler
)
from app.models.ocr_schemas import (
    OcrPdfRequest, ExtractTextOcrRequest, ExtractTextOcrResponse
)

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR Tools"])


@router.post("/pdf-to-searchable", response_class=FileResponse)
async def ocr_pdf_endpoint(
    file: UploadFile = File(..., description="Scanned/image-based PDF"),
    language: str = Form(default="eng", description="OCR language (eng, fra, deu, spa, etc.)"),
    dpi: int = Form(default=300, ge=150, le=600, description="DPI for OCR (150-600)")
) -> FileResponse:
    """
    Convert image-based PDF to searchable PDF using OCR.
    
    **Request:**
    - file: Scanned or image-based PDF
    - language: Tesseract language code (default: eng)
      - **eng**: English
      - **fra**: French
      - **deu**: German
      - **spa**: Spanish
      - **ita**: Italian
      - **por**: Portuguese
      - **rus**: Russian
      - **ara**: Arabic
      - **chi_sim**: Chinese Simplified
      - **jpn**: Japanese
    - dpi: Resolution for OCR (150-600, default: 300)
    
    **Response:**
    - Searchable PDF with embedded text layer
    
    **Use cases:**
    - Make scanned documents searchable
    - Enable text selection in image PDFs
    - Improve PDF accessibility
    
    **Note:** Higher DPI = better accuracy but slower processing.
    Recommended: 300 DPI for most documents.
    """
    request = OcrPdfRequest(language=language, dpi=dpi)
    return await ocr_pdf_handler(file, request)


@router.post("/extract-text", response_model=ExtractTextOcrResponse)
async def extract_text_ocr_endpoint(
    file: UploadFile = File(..., description="Scanned/image-based PDF"),
    language: str = Form(default="eng", description="OCR language (eng, fra, deu, spa, etc.)"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'")
) -> ExtractTextOcrResponse:
    """
    Extract text from scanned PDF using OCR.
    
    **Request:**
    - file: Scanned or image-based PDF
    - language: Tesseract language code (default: eng)
    - page_range: Optional page range (e.g., "1-3,5")
    
    **Response:**
    - JSON with extracted text, page count, and character count
    
    **Use cases:**
    - Extract text from scanned documents
    - Convert images to text
    - Process receipts, invoices, forms
    
    **Supported languages:** Same as pdf-to-searchable endpoint
    """
    request = ExtractTextOcrRequest(language=language, page_range=page_range)
    return await extract_text_ocr_handler(file, request)