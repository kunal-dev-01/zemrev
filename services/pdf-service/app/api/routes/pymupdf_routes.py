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
    optimize_pdf_handler,
    sign_pdf_handler,
    crop_pdf_handler
)
from app.models.pymupdf_schemas import (
    PdfToImagesRequest, ImagesToPdfRequest, ExtractTextRequest,
    ExtractImagesRequest, AddWatermarkRequest, OptimizePdfRequest,
    ExtractTextResponse, ImageFormat, WatermarkPosition,SignPdfRequest, CropPdfRequest,
)

router = APIRouter(prefix="/api/v1/pymupdf", tags=["PyMuPDF Tools"])


@router.post("/pdf-to-images", response_class=FileResponse)
async def pdf_to_images_endpoint(
    file: UploadFile = File(..., description="PDF file to convert"),
    format: ImageFormat = Form(default=ImageFormat.PNG, description="Output image format"),
    dpi: int = Form(default=150, ge=72, le=300, description="DPI (72-300)"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'")
) -> FileResponse:
    
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
    
    return await images_to_pdf_handler(files)


@router.post("/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    page_range: Optional[str] = Form(None, description="Page range like '1-3,5'"),
    preserve_layout: bool = Form(default=False, description="Preserve layout")
) -> ExtractTextResponse:
    
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

    request = OptimizePdfRequest(
        remove_metadata=remove_metadata,
        remove_annotations=remove_annotations,
        remove_javascript=remove_javascript,
        remove_links=remove_links,
        compress_images=compress_images
    )
    return await optimize_pdf_handler(file, request)

@router.post("/sign", response_class=FileResponse)
async def sign_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to sign"),
    signature_text: Optional[str] = Form(None, description="Text signature (e.g., 'John Doe')"),
    signature_image: Optional[UploadFile] = File(None, description="Signature image file"),
    x: int = Form(50, ge=0, description="X position on page"),
    y: int = Form(50, ge=0, description="Y position on page"),
    width: int = Form(200, ge=10, le=500, description="Signature width (10-500)"),
    height: int = Form(100, ge=10, le=300, description="Signature height (10-300)"),
    page: int = Form(0, ge=0, description="Page number (0-indexed)")
) -> FileResponse:
    """
    Add a signature to a PDF document.
    Either provide signature_text OR signature_image.
    """
    if not signature_text and not signature_image:
        raise HTTPException(
            status_code=400,
            detail="Either 'signature_text' or 'signature_image' must be provided"
        )
    
    request = SignPdfRequest(
        signature_text=signature_text,
        x=x,
        y=y,
        width=width,
        height=height,
        page=page
    )
    return await sign_pdf_handler(file, request, signature_image)


@router.post("/crop", response_class=FileResponse)
async def crop_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to crop"),
    x: int = Form(..., ge=0, description="X coordinate (left)"),
    y: int = Form(..., ge=0, description="Y coordinate (top)"),
    width: int = Form(..., ge=10, description="Crop width"),
    height: int = Form(..., ge=10, description="Crop height")
) -> FileResponse:
    """
    Crop all pages of a PDF to specified dimensions.
    Coordinates are in points (1/72 inch).
    """
    request = CropPdfRequest(
        x=x,
        y=y,
        width=width,
        height=height
    )
    return await crop_pdf_handler(file, request)
