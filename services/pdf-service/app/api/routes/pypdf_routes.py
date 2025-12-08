"""
============================================================================
FILE: app/api/routes/pypdf_routes.py
PURPOSE: API routes for PDF operations
============================================================================
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from typing import List

from app.api.controllers.pypdf_controller import (
    merge_pdfs_handler,
    split_pdf_handler,
    rotate_pdf_handler,
    encrypt_pdf_handler,
    decrypt_pdf_handler
)
from app.models.schemas import (
    SplitRequest, RotateRequest, EncryptRequest, DecryptRequest
)

router = APIRouter(prefix="/api/v1/pdf", tags=["PDF Tools"])


@router.post("/merge", response_class=FileResponse)
async def merge_pdfs_endpoint(
    files: List[UploadFile] = File(..., description="PDF files to merge (minimum 2)")
) -> FileResponse:
    """
    Merge multiple PDF files into one.
    
    **Request:**
    - files: List of PDF files (minimum 2)
    
    **Response:**
    - Merged PDF file
    """
    return await merge_pdfs_handler(files)


@router.post("/split", response_class=StreamingResponse)
async def split_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to split"),
    pages: str = Form(..., description="Page ranges like '1-3,5,8-10'")
) -> StreamingResponse:
    """
    Split PDF into multiple files based on page ranges.
    
    **Request:**
    - file: PDF file to split
    - pages: Page ranges (e.g., "1-3,5,8-10")
    
    **Response:**
    - ZIP file containing split PDFs
    
    **Page Range Examples:**
    - "1-3" - Pages 1 to 3
    - "1-3,5" - Pages 1-3 and page 5
    - "1-3,5,8-10" - Pages 1-3, page 5, and pages 8-10
    """
    request = SplitRequest(pages=pages)
    return await split_pdf_handler(file, request)


@router.post("/rotate", response_class=FileResponse)
async def rotate_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to rotate"),
    rotations: str = Form(..., description="Rotations like '1:90,3:270'")
) -> FileResponse:
    """
    Rotate specific pages in a PDF.
    
    **Request:**
    - file: PDF file
    - rotations: Page rotations (e.g., "1:90,3:270")
    
    **Response:**
    - Rotated PDF file
    
    **Rotation Examples:**
    - "1:90" - Rotate page 1 by 90 degrees clockwise
    - "1:90,3:270" - Rotate page 1 by 90° and page 3 by 270°
    - Valid degrees: 90, 180, 270
    """
    request = RotateRequest(rotations=rotations)
    return await rotate_pdf_handler(file, request)


@router.post("/encrypt", response_class=FileResponse)
async def encrypt_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to encrypt"),
    user_password: str = Form(None, description="Password for opening PDF"),
    owner_password: str = Form(None, description="Password for permissions")
) -> FileResponse:
    """
    Encrypt a PDF with password protection.
    
    **Request:**
    - file: PDF file
    - user_password: Password for opening (optional)
    - owner_password: Password for permissions (optional)
    
    **Response:**
    - Encrypted PDF file
    
    **Note:** At least one password must be provided.
    The encrypted PDF will have printing and copying disabled.
    """
    # Validate at least one password
    if not user_password and not owner_password:
        raise HTTPException(
            status_code=400,
            detail="At least one password (user_password or owner_password) must be provided"
        )
    
    request = EncryptRequest(
        user_password=user_password,
        owner_password=owner_password
    )
    return await encrypt_pdf_handler(file, request)


@router.post("/decrypt", response_class=FileResponse)
async def decrypt_pdf_endpoint(
    file: UploadFile = File(..., description="Encrypted PDF file"),
    password: str = Form(..., description="Password to decrypt")
) -> FileResponse:
    """
    Decrypt a password-protected PDF.
    
    **Request:**
    - file: Encrypted PDF file
    - password: Password to decrypt
    
    **Response:**
    - Decrypted PDF file
    
    **Error Responses:**
    - 400: Incorrect password or PDF not encrypted
    - 500: Decryption failed
    """
    request = DecryptRequest(password=password)
    return await decrypt_pdf_handler(file, request)