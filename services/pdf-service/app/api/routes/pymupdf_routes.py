"""
============================================================================
FILE: app/api/routes/pymupdf_routes.py
PURPOSE: API routes for PyMuPDF operations
============================================================================
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from typing import List, Optional

from app.api.controllers.pymupdf_controller import (
    pdf_to_images_handler,
    images_to_pdf_handler,
    extract_text_handler,
    extract_images_handler,
    add_watermark_handler,
    optimize_pdf_handler
)
from app.models.pymupdf_schemas import (
    PdfToImagesRequest, ImagesToPdfRequest, ExtractTextRequest,
    ExtractImagesRequest, AddWatermarkRequest, OptimizePdfRequest,
    ExtractTextResponse, ImageFormat, WatermarkPosition
)

router = APIRouter(prefix="/api/v1/pymupdf", tags=["PyMuPDF Tools"])


@router.post("/pdf-to-images", response_class=FileResponse)
async def pdf_to_images_endpoint(
    file: UploadFile = File(..., description="PDF file to convert"),
    format: ImageFormat = Form(default=ImageFormat.PNG, description="Output image format"),
    dpi: int = Form(default=150, ge=72, le=300, description="DPI (72-300)"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'")
) -> FileResponse:
    """
    Convert PDF pages to images.
    
    **Request:**
    - file: PDF file
    - format: Output format (png, jpeg, jpg)
    - dpi: Resolution (72-300, default: 150)
    - page_range: Optional page range (e.g., "1-3,5")
    
    **Response:**
    - ZIP file containing images
    """
    request = PdfToImagesRequest(
        format=format,
        dpi=dpi,
        page_range=page_range
    )
    return await pdf_to_images_handler(file, request)


@router.post("/images-to-pdf", response_class=FileResponse)
async def images_to_pdf_endpoint(
    files: List[UploadFile] = File(..., description="Image files to convert")
) -> FileResponse:
    """
    Convert images to a single PDF.
    
    **Request:**
    - files: List of image files (JPG, PNG, etc.)
    
    **Response:**
    - PDF file containing all images
    """
    return await images_to_pdf_handler(files)


@router.post("/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'"),
    preserve_layout: bool = Form(default=False, description="Preserve layout")
) -> ExtractTextResponse:
    """
    Extract text from PDF.
    
    **Request:**
    - file: PDF file
    - page_range: Optional page range (e.g., "1-3,5")
    - preserve_layout: Whether to preserve text layout
    
    **Response:**
    - JSON with extracted text, page count, and character count
    """
    request = ExtractTextRequest(
        page_range=page_range,
        preserve_layout=preserve_layout
    )
    return await extract_text_handler(file, request)


@router.post("/extract-images", response_class=FileResponse)
async def extract_images_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'"),
    min_width: int = Form(default=100, ge=10, description="Min image width"),
    min_height: int = Form(default=100, ge=10, description="Min image height")
) -> FileResponse:
    """
    Extract images from PDF.
    
    **Request:**
    - file: PDF file
    - page_range: Optional page range (e.g., "1-3,5")
    - min_width: Minimum image width (default: 100)
    - min_height: Minimum image height (default: 100)
    
    **Response:**
    - ZIP file containing extracted images
    """
    request = ExtractImagesRequest(
        page_range=page_range,
        min_width=min_width,
        min_height=min_height
    )
    return await extract_images_handler(file, request)


@router.post("/add-watermark", response_class=FileResponse)
async def add_watermark_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    text: Optional[str] = Form(None, description="Watermark text"),
    watermark_image: Optional[UploadFile] = File(None, description="Watermark image"),
    opacity: float = Form(default=0.3, ge=0.1, le=1.0, description="Opacity (0.1-1.0)"),
    position: WatermarkPosition = Form(default=WatermarkPosition.CENTER, description="Position"),
    font_size: int = Form(default=50, ge=10, le=200, description="Font size (10-200)"),
    rotation: int = Form(default=45, ge=0, le=360, description="Rotation (0-360)"),
    color: str = Form(default="gray", description="Text color")
) -> FileResponse:
    """
    Add watermark to PDF (text or image).
    
    **Request:**
    - file: PDF file
    - text: Watermark text (optional if watermark_image provided)
    - watermark_image: Watermark image file (optional if text provided)
    - opacity: Opacity (0.1-1.0, default: 0.3)
    - position: Position preset (center, top_left, top_right, bottom_left, bottom_right)
    - font_size: Text font size (10-200, default: 50)
    - rotation: Rotation angle (0-360, default: 45)
    - color: Text color (e.g., 'red', 'blue', 'gray')
    
    **Response:**
    - Watermarked PDF file
    
    **Note:** Either text or watermark_image must be provided.
    """
    if not text and not watermark_image:
        raise HTTPException(
            status_code=400,
            detail="Either 'text' or 'watermark_image' must be provided"
        )
    
    request = AddWatermarkRequest(
        text=text,
        opacity=opacity,
        position=position,
        font_size=font_size,
        rotation=rotation,
        color=color
    )
    return await add_watermark_handler(file, request, watermark_image)


@router.post("/optimize", response_class=FileResponse)
async def optimize_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to optimize"),
    remove_metadata: bool = Form(default=True, description="Remove metadata"),
    remove_annotations: bool = Form(default=True, description="Remove annotations"),
    remove_javascript: bool = Form(default=True, description="Remove JavaScript"),
    remove_links: bool = Form(default=True, description="Remove links"),
    compress_images: bool = Form(default=False, description="Compress images")
) -> FileResponse:
    """
    Optimize PDF by removing unnecessary elements.
    
    **Request:**
    - file: PDF file
    - remove_metadata: Remove metadata (default: true)
    - remove_annotations: Remove annotations (default: true)
    - remove_javascript: Remove JavaScript (default: true)
    - remove_links: Remove hyperlinks (default: true)
    - compress_images: Compress embedded images (default: false)
    
    **Response:**
    - Optimized PDF file
    """
    request = OptimizePdfRequest(
        remove_metadata=remove_metadata,
        remove_annotations=remove_annotations,
        remove_javascript=remove_javascript,
        remove_links=remove_links,
        compress_images=compress_images
    )
    return await optimize_pdf_handler(file, request)