"""
============================================================================
FILE: services/pdf-service/app/api/controllers/pymupdf_controller.py
PURPOSE: Controller logic for PyMuPDF operations
============================================================================
"""

from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse, Response
from concurrent.futures import ThreadPoolExecutor
import asyncio
import tempfile

from app.services.validator import validate_upload
from app.services.pymupdf.pdf_to_images import pdf_to_images
from app.services.pymupdf.images_to_pdf import images_to_pdf
from app.services.pymupdf.extract_text import extract_text_from_pdf
from app.services.pymupdf.extract_images import extract_images_from_pdf
from app.services.pymupdf.add_watermark import add_text_watermark, add_image_watermark
from app.services.pymupdf.optimize_pdf import optimize_pdf
from app.services.pymupdf.sign_pdf import sign_pdf
from app.services.pymupdf.crop_pdf import crop_pdf
from app.models.pymupdf_schemas import (
    PdfToImagesRequest, ImagesToPdfRequest, ExtractTextRequest,
    ExtractImagesRequest, AddWatermarkRequest, SignPdfRequest, CropPdfRequest, OptimizePdfRequest,ExtractTextResponse, OptimizePdfResponse
)
from app.utils.file_io import (
    create_temp_pdf_path, safe_remove, safe_remove_multiple, create_zip_from_pdfs,
    create_zip_from_files
)
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


async def pdf_to_images_handler(
    file: UploadFile,
    request: PdfToImagesRequest
) -> FileResponse:
    """Handle PDF to Images conversion."""
    input_path = None
    output_paths = []
    zip_path = None
    output_dir = None
    
    try:
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
        
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename=f"pdf_images.zip",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF to images failed: {e}")
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


async def images_to_pdf_handler(files: List[UploadFile]) -> FileResponse:
    """Handle Images to PDF conversion."""
    temp_paths = []
    output_path = None
    
    try:
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
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="images_to_pdf.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Images to PDF failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        safe_remove_multiple(temp_paths)


async def extract_text_handler(
    file: UploadFile,
    request: ExtractTextRequest
) -> ExtractTextResponse:
    """Handle text extraction from PDF."""
    input_path = None
    
    try:
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
        
        return ExtractTextResponse(
            text=text,
            page_count=page_count,
            char_count=len(text)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)


async def extract_images_handler(
    file: UploadFile,
    request: ExtractImagesRequest
) -> FileResponse:
    """Handle image extraction from PDF."""
    input_path = None
    output_paths = []
    zip_path = None
    output_dir = None
    
    try:
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
        
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="extracted_images.zip",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image extraction failed: {e}")
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


async def add_watermark_handler(
    file: UploadFile,
    request: AddWatermarkRequest,
    watermark_image: UploadFile = None
) -> FileResponse:
    """Handle watermark addition to PDF."""
    input_path = None
    output_path = None
    watermark_image_path = None
    
    try:
        # Validate PDF upload
        input_path = await validate_upload(file)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="watermarked")
        
        # Check if text or image watermark
        if watermark_image:
            # Image watermark
            # Save watermark image
            content = await watermark_image.read()
            temp_file = tempfile.NamedTemporaryFile(
                mode='wb',
                delete=False,
                suffix=Path(watermark_image.filename).suffix,
                dir=settings.UPLOAD_DIR
            )
            temp_file.write(content)
            temp_file.close()
            watermark_image_path = Path(temp_file.name)
            
            # Add image watermark
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                executor,
                add_image_watermark,
                input_path,
                output_path,
                watermark_image_path,
                request.opacity,
                request.position.value,
                0.3  # scale
            )
        elif request.text:
            # Text watermark
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                executor,
                add_text_watermark,
                input_path,
                output_path,
                request.text,
                request.opacity,
                request.position.value,
                request.font_size,
                request.rotation,
                request.color
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either text or watermark_image must be provided"
            )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="watermarked.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Watermark addition failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        if watermark_image_path:
            safe_remove(watermark_image_path)


async def optimize_pdf_handler(
    file: UploadFile,
    request: OptimizePdfRequest
) -> FileResponse:
    """Handle PDF optimization."""
    input_path = None
    output_path = None
    
    try:
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
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="optimized.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)

async def sign_pdf_handler(
    file: UploadFile,
    request: SignPdfRequest,
    signature_image: Optional[UploadFile] = None
) -> FileResponse:
    """Handle PDF signing."""
    input_path = None
    output_path = None
    signature_image_path = None
    
    try:
        input_path = await validate_upload(file)
        output_path = create_temp_pdf_path(prefix="signed")
        
        if signature_image:
            content = await signature_image.read()
            temp_file = tempfile.NamedTemporaryFile(
                mode='wb',
                delete=False,
                suffix=Path(signature_image.filename).suffix,
                dir=settings.UPLOAD_DIR
            )
            temp_file.write(content)
            temp_file.close()
            signature_image_path = Path(temp_file.name)
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            sign_pdf,
            input_path,
            output_path,
            request.signature_text,
            signature_image_path,
            request.x,
            request.y,
            request.width,
            request.height,
            request.page
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="signed.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF signing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        if signature_image_path:
            safe_remove(signature_image_path)


async def crop_pdf_handler(
    file: UploadFile,
    request: CropPdfRequest
) -> FileResponse:
    """Handle PDF cropping."""
    input_path = None
    output_path = None
    
    try:
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
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="cropped.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF cropping failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
