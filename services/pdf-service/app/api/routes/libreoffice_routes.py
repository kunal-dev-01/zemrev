"""
============================================================================
FILE: services/pdf-service/app/api/routes/libreoffice_routes.py
PURPOSE: API routes for LibreOffice operations
============================================================================
"""

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse

from app.api.controllers.libreoffice_controller import (
    word_to_pdf_handler,
    pdf_to_word_handler,
    generic_to_pdf_handler
)

router = APIRouter(prefix="/api/v1/libreoffice", tags=["LibreOffice Tools"])


@router.post("/word-to-pdf", response_class=FileResponse)
async def word_to_pdf_endpoint(
    file: UploadFile = File(..., description="Word document (DOCX, DOC)")
) -> FileResponse:
    """
    Convert Word document to PDF.
    
    **Request:**
    - file: Word document (.docx, .doc)
    
    **Response:**
    - PDF file
    
    **Supported formats:** DOCX, DOC, ODT, RTF
    """
    return await word_to_pdf_handler(file)


@router.post("/pdf-to-word", response_class=FileResponse)
async def pdf_to_word_endpoint(
    file: UploadFile = File(..., description="PDF file")
) -> FileResponse:
    """
    Convert PDF to Word document (DOCX).
    
    **Request:**
    - file: PDF file
    
    **Response:**
    - Word document (.docx)
    
    **Note:** Best results with text-based PDFs. 
    For scanned PDFs, use OCR tool first.
    """
    return await pdf_to_word_handler(file)


@router.post("/html-to-pdf", response_class=FileResponse)
async def html_to_pdf_endpoint(
    file: UploadFile = File(..., description="HTML file")
) -> FileResponse:
    """
    Convert HTML to PDF.
    
    **Request:**
    - file: HTML file (.html, .htm)
    
    **Response:**
    - PDF file
    """
    return await generic_to_pdf_handler(file)


@router.post("/excel-to-pdf", response_class=FileResponse)
async def excel_to_pdf_endpoint(
    file: UploadFile = File(..., description="Excel file (XLSX, XLS)")
) -> FileResponse:
    """
    Convert Excel to PDF.
    
    **Request:**
    - file: Excel file (.xlsx, .xls)
    
    **Response:**
    - PDF file
    
    **Supported formats:** XLSX, XLS, ODS
    """
    return await generic_to_pdf_handler(file)


@router.post("/powerpoint-to-pdf", response_class=FileResponse)
async def powerpoint_to_pdf_endpoint(
    file: UploadFile = File(..., description="PowerPoint file (PPTX, PPT)")
) -> FileResponse:
    """
    Convert PowerPoint to PDF.
    
    **Request:**
    - file: PowerPoint file (.pptx, .ppt)
    
    **Response:**
    - PDF file
    
    **Supported formats:** PPTX, PPT, ODP
    """
    return await generic_to_pdf_handler(file)