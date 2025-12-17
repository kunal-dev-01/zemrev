"""
============================================================================
FILE: services/pdf-service/app/api/routes/pymupdf_routes.py (UPDATED)
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
    optimize_pdf_handler,
    crop_pdf_handler
)
from app.api.controllers.watermark_controller import add_watermark_handler
from app.api.controllers.sign_pdf_controller import sign_pdf_handler
from app.models.pymupdf_schemas import (
    PdfToImagesRequest, ExtractTextRequest,
    ExtractImagesRequest, AddWatermarkRequest, OptimizePdfRequest,
    ExtractTextResponse, ImageFormat, CropPdfRequest,
)

router = APIRouter(prefix="/api/v1/pymupdf", tags=["PyMuPDF Tools"])


# ============================================================================
# PDF TO IMAGES
# ============================================================================

@router.post("/pdf-to-images", response_class=FileResponse)
async def pdf_to_images_endpoint(
    file: UploadFile = File(..., description="PDF file to convert"),
    format: ImageFormat = Form(
        default=ImageFormat.PNG, 
        description="Output image format"
    ),
    dpi: int = Form(
        default=150, 
        ge=72, 
        le=300, 
        description="DPI (72-300)"
    ),
    page_range: Optional[str] = Form(
        None, 
        description="Page range like '1-3,5'"
    )
) -> FileResponse:
    """Convert PDF pages to images."""
    request = PdfToImagesRequest(
        format=format,
        dpi=dpi,
        page_range=page_range
    )
    return await pdf_to_images_handler(file, request)


# ============================================================================
# IMAGES TO PDF
# ============================================================================

@router.post("/images-to-pdf", response_class=FileResponse)
async def images_to_pdf_endpoint(
    files: List[UploadFile] = File(..., description="Image files to convert")
) -> FileResponse:
    """Convert multiple images into a single PDF."""
    return await images_to_pdf_handler(files)


# ============================================================================
# EXTRACT TEXT
# ============================================================================

@router.post("/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    page_range: Optional[str] = Form(
        None, 
        description="Page range like '1-3,5'"
    ),
    preserve_layout: bool = Form(
        default=False, 
        description="Preserve layout"
    )
) -> ExtractTextResponse:
    """Extract text from PDF."""
    request = ExtractTextRequest(
        page_range=page_range,
        preserve_layout=preserve_layout
    )
    return await extract_text_handler(file, request)


# ============================================================================
# EXTRACT IMAGES
# ============================================================================

@router.post("/extract-images", response_class=FileResponse)
async def extract_images_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    page_range: Optional[str] = Form(
        None, 
        description="Page range like '1-3,5'"
    ),
    min_width: int = Form(
        default=100, 
        ge=10, 
        description="Min image width"
    ),
    min_height: int = Form(
        default=100, 
        ge=10, 
        description="Min image height"
    )
) -> FileResponse:
    """Extract images from PDF."""
    request = ExtractImagesRequest(
        page_range=page_range,
        min_width=min_width,
        min_height=min_height
    )
    return await extract_images_handler(file, request)


# ============================================================================
# ADD WATERMARK
# ============================================================================

@router.post("/add-watermark", response_class=FileResponse)
async def add_watermark_endpoint(
    file: UploadFile = File(..., description="PDF file"),
    text: Optional[str] = Form(None, description="Watermark text"),
    font: Optional[str] = Form(None, description="Font name (e.g., 'Arial', 'Times New Roman')"),
    watermark_image: Optional[UploadFile] = File(
        None, 
        description="Watermark image"
    ),
    opacity: float = Form(
        default=0.3, 
        ge=0.1, 
        le=1.0, 
        description="Opacity (0.1-1.0)"
    ),
    font_size: int = Form(
        default=50, 
        ge=10, 
        le=200, 
        description="Font size (10-200)"
    ),
    rotation: int = Form(
        default=45, 
        ge=0, 
        le=360, 
        description="Rotation (0-360)"
    ),
    color: str = Form(default="gray", description="Text color"),
    x: int = Form(default=150, ge=0, le=1000, description="X position"),
    y: int = Form(default=350, ge=0, le=1500, description="Y position"),
    width: int = Form(default=300, ge=50, le=800, description="Width"),
    height: int = Form(default=150, ge=20, le=600, description="Height"),
) -> FileResponse:
    """
    Add text or image watermark to PDF with font support.
    
    **Text Watermark Features:**
    - Custom text content
    - Font selection: Arial, Arial Black, Times New Roman, Courier New, Impact, Comic Sans MS, Georgia, Verdana
    - Color selection: gray, black, white, red, blue, green, yellow, orange, purple
    - Font size: 10-200pt
    - Rotation: 0-360°
    - Opacity: 0.1-1.0
    
    **Image Watermark Features:**
    - PNG, JPG, GIF support
    - Rotation: 0-360°
    - Opacity: 0.1-1.0
    
    **Positioning:**
    - X/Y coordinates in PDF points (drag & drop in frontend)
    - Width: 50-800pt
    - Height: 20-600pt
    """
    if not text and not watermark_image:
        raise HTTPException(
            status_code=400,
            detail="Either 'text' or 'watermark_image' must be provided"
        )
    
    request = AddWatermarkRequest(
        text=text,
        font=font,  # NEW
        opacity=opacity,
        font_size=font_size,
        rotation=rotation,
        color=color,
        x=x,
        y=y,
        width=width,
        height=height,
    )
    return await add_watermark_handler(file, request, watermark_image)


# ============================================================================
# OPTIMIZE PDF
# ============================================================================

@router.post("/optimize", response_class=FileResponse)
async def optimize_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to optimize"),
    remove_metadata: bool = Form(
        default=True, 
        description="Remove metadata"
    ),
    remove_annotations: bool = Form(
        default=True, 
        description="Remove annotations"
    ),
    remove_javascript: bool = Form(
        default=True, 
        description="Remove JavaScript"
    ),
    remove_links: bool = Form(
        default=True, 
        description="Remove links"
    ),
    compress_images: bool = Form(
        default=False, 
        description="Compress images"
    )
) -> FileResponse:
    """Optimize PDF by removing unnecessary elements."""
    request = OptimizePdfRequest(
        remove_metadata=remove_metadata,
        remove_annotations=remove_annotations,
        remove_javascript=remove_javascript,
        remove_links=remove_links,
        compress_images=compress_images
    )
    return await optimize_pdf_handler(file, request)


# ============================================================================
# SIGN PDF (UPDATED - MULTIPLE SIGNATURES)
# ============================================================================

@router.post("/sign", response_class=FileResponse)
async def sign_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to sign"),
    signatures_json: str = Form(
        ..., 
        description="JSON array of signature objects"
    ),
    signature_image_files: Optional[List[UploadFile]] = File(
        None,
        description="Image files for image signatures (in order)"
    )
) -> FileResponse:
    """
    Add multiple signatures to a PDF document.
    
    **Accepts:**
    - `file`: PDF to sign
    - `signatures_json`: JSON string with signature data (without image files)
    - `signature_image_files`: Image files for image signatures (in order)
    
    **Example signatures_json:**
    ```json
    [
      {
        "id": "sig_123",
        "type": "text",
        "text": "John Doe",
        "font": "Arial",
        "x": 50,
        "y": 100,
        "width": 200,
        "height": 80,
        "page": 0
      },
      {
        "id": "sig_456",
        "type": "image",
        "x": 300,
        "y": 200,
        "width": 150,
        "height": 60,
        "page": 1
      }
    ]
    ```
    
    **Limits:**
    - Maximum 100 signatures per PDF
    - Page numbers: 0-99 (0-indexed)
    - Signature width: 10-500pt
    - Signature height: 10-300pt
    """
    return await sign_pdf_handler(file, signatures_json, signature_image_files)


# ============================================================================
# CROP PDF
# ============================================================================

@router.post("/crop", response_class=FileResponse)
async def crop_pdf_endpoint(
    file: UploadFile = File(..., description="PDF file to crop"),
    x: int = Form(..., ge=0, description="X coordinate (left)"),
    y: int = Form(..., ge=0, description="Y coordinate (top)"),
    width: int = Form(..., ge=10, description="Crop width"),
    height: int = Form(..., ge=10, description="Crop height"),
    page_range: Optional[str] = Form(
        None,
        description="Page range like '1-3,5'"
    )
) -> FileResponse:
    """
    Crop all pages of a PDF to specified dimensions.
    Coordinates are in points (1/72 inch).
    """
    request = CropPdfRequest(
        x=x,
        y=y,
        width=width,
        height=height,
        page_range=page_range
    )
    return await crop_pdf_handler(file, request)