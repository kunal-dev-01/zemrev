"""
============================================================================
FILE: services/pdf-service/app/api/controllers/pymupdf_controller.py (CLEAN)
PURPOSE: Controller logic for PyMuPDF operations (without sign_pdf)
============================================================================
"""

from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio
import tempfile

from app.services.validator import validate_upload
from app.services.pymupdf.pdf_to_images import pdf_to_images
from app.services.pymupdf.images_to_pdf import images_to_pdf
from app.services.pymupdf.extract_text import extract_text_from_pdf
from app.services.pymupdf.extract_images import extract_images_from_pdf
from app.services.pymupdf.optimize_pdf import optimize_pdf
from app.services.pymupdf.crop_pdf import crop_pdf
from app.models.pymupdf_schemas import (
    PdfToImagesRequest, ExtractTextRequest,
    ExtractImagesRequest, 
    CropPdfRequest, OptimizePdfRequest,
    ExtractTextResponse
)
from app.utils.file_io import (
    create_temp_pdf_path, safe_remove, safe_remove_multiple,
    create_zip_from_files
)
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


# ============================================================================
# PDF TO IMAGES
# ============================================================================

async def pdf_to_images_handler(
    file: UploadFile,
    request: PdfToImagesRequest
) -> FileResponse:
    """Handle PDF to Images conversion."""
    input_path = None
    output_paths = []
    output_dir = None
    
    try:
        logger.info("Starting PDF to images conversion...")
        
        # Validate upload
        input_path = await validate_upload(file)
        
        # Create temp output directory
        output_dir = Path(tempfile.mkdtemp(dir=settings.UPLOAD_DIR))
        
        # Run conversion in thread pool
        loop = asyncio.get_event_loop()
        output_paths = await loop.run_in_executor(
            executor,
            pdf_to_images,
            input_path,
            output_dir,
            request.format.value,
            request.dpi,
            request.page_range
        )
        
        # Create ZIP
        zip_path = create_zip_from_files(output_paths, zip_prefix="pdf_images")
        
        logger.info(f"Successfully converted PDF to {len(output_paths)} images")
        
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="pdf_images.zip",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF to images failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        safe_remove_multiple(output_paths)
        if output_dir and output_dir.exists():
            try:
                output_dir.rmdir()
            except:
                pass


# ============================================================================
# IMAGES TO PDF
# ============================================================================

async def images_to_pdf_handler(files: List[UploadFile]) -> FileResponse:
    """Handle Images to PDF conversion."""
    temp_paths = []
    output_path = None
    
    try:
        logger.info(f"Converting {len(files)} images to PDF...")
        
        if len(files) < 1:
            raise HTTPException(status_code=400, detail="At least 1 image required")
        
        # Validate and save all images
        for file in files:
            # Check if it's an image
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is not an image"
                )
            
            # Save to temp
            content = await file.read()
            temp_file = tempfile.NamedTemporaryFile(
                mode='wb',
                delete=False,
                suffix=Path(file.filename).suffix,
                dir=settings.UPLOAD_DIR
            )
            temp_file.write(content)
            temp_file.close()
            temp_paths.append(Path(temp_file.name))
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="images_to_pdf")
        
        # Run conversion
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            images_to_pdf,
            temp_paths,
            output_path
        )
        
        logger.info("Successfully converted images to PDF")
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="images_to_pdf.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Images to PDF failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        safe_remove_multiple(temp_paths)


# ============================================================================
# EXTRACT TEXT
# ============================================================================

async def extract_text_handler(
    file: UploadFile,
    request: ExtractTextRequest
) -> ExtractTextResponse:
    """Handle text extraction from PDF."""
    input_path = None
    
    try:
        logger.info("Extracting text from PDF...")
        
        # Validate upload
        input_path = await validate_upload(file)
        
        # Extract text
        loop = asyncio.get_event_loop()
        text, page_count = await loop.run_in_executor(
            executor,
            extract_text_from_pdf,
            input_path,
            request.page_range,
            request.preserve_layout
        )
        
        logger.info(f"Extracted {len(text)} characters from {page_count} pages")
        
        return ExtractTextResponse(
            text=text,
            page_count=page_count,
            char_count=len(text)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)


# ============================================================================
# EXTRACT IMAGES
# ============================================================================

async def extract_images_handler(
    file: UploadFile,
    request: ExtractImagesRequest
) -> FileResponse:
    """Handle image extraction from PDF."""
    input_path = None
    output_paths = []
    output_dir = None
    
    try:
        logger.info("Extracting images from PDF...")
        
        # Validate upload
        input_path = await validate_upload(file)
        
        # Create temp output directory
        output_dir = Path(tempfile.mkdtemp(dir=settings.UPLOAD_DIR))
        
        # Extract images
        loop = asyncio.get_event_loop()
        output_paths = await loop.run_in_executor(
            executor,
            extract_images_from_pdf,
            input_path,
            output_dir,
            request.page_range,
            request.min_width,
            request.min_height
        )
        
        if not output_paths:
            raise HTTPException(
                status_code=404,
                detail="No images found in PDF matching the size criteria"
            )
        
        # Create ZIP
        zip_path = create_zip_from_files(output_paths, zip_prefix="extracted_images")
        
        logger.info(f"Extracted {len(output_paths)} images from PDF")
        
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="extracted_images.zip",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        safe_remove_multiple(output_paths)
        if output_dir and output_dir.exists():
            try:
                output_dir.rmdir()
            except:
                pass

# ============================================================================
# OPTIMIZE PDF
# ============================================================================

async def optimize_pdf_handler(
    file: UploadFile,
    request: OptimizePdfRequest
) -> FileResponse:
    """Handle PDF optimization."""
    input_path = None
    output_path = None
    
    try:
        logger.info("Optimizing PDF...")
        
        # Validate upload
        input_path = await validate_upload(file)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="optimized")
        
        # Optimize PDF
        loop = asyncio.get_event_loop()
        original_size, optimized_size = await loop.run_in_executor(
            executor,
            optimize_pdf,
            input_path,
            output_path,
            request.remove_metadata,
            request.remove_annotations,
            request.remove_javascript,
            request.remove_links,
            request.compress_images
        )
        
        reduction = ((original_size - optimized_size) / original_size) * 100
        logger.info(
            f"PDF optimized: {original_size/1024:.2f}KB → "
            f"{optimized_size/1024:.2f}KB ({reduction:.1f}% reduction)"
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="optimized.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)


# ============================================================================
# CROP PDF
# ============================================================================

async def crop_pdf_handler(
    file: UploadFile,
    request: CropPdfRequest
) -> FileResponse:
    """Handle PDF cropping."""
    input_path = None
    output_path = None
    
    try:
        logger.info("Cropping PDF...")
        
        input_path = await validate_upload(file)
        output_path = create_temp_pdf_path(prefix="cropped")
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            crop_pdf,
            input_path,
            output_path,
            request.x,
            request.y,
            request.width,
            request.height,
            request.page_range
        )
        
        logger.info("Successfully cropped PDF")
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="cropped.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF cropping failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)