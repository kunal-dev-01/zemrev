"""
============================================================================
FILE: services/pdf-service/app/api/controllers/watermark_controller.py (NEW)
PURPOSE: Dedicated controller for watermark operations
============================================================================
"""

from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio
import tempfile

from app.services.validator import validate_upload
from app.services.pymupdf.add_watermark import add_text_watermark, add_image_watermark
from app.models.pymupdf_schemas import AddWatermarkRequest
from app.utils.file_io import create_temp_pdf_path, safe_remove
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


async def add_watermark_handler(
    file: UploadFile,
    request: AddWatermarkRequest,
    watermark_image: Optional[UploadFile] = None
) -> FileResponse:
    """
    Handle watermark addition to PDF with font support.
    
    Args:
        file: PDF file to watermark
        request: Watermark settings
        watermark_image: Optional image file for image watermarks
    
    Returns:
        FileResponse with watermarked PDF
    
    Raises:
        HTTPException: If validation or processing fails
    """
    input_path = None
    output_path = None
    watermark_image_path = None
    
    try:
        # ================================================================
        # STEP 1: Validate PDF File
        # ================================================================
        logger.info("Validating PDF file...")
        input_path = await validate_upload(file)
        output_path = create_temp_pdf_path(prefix="watermarked")
        
        # ================================================================
        # STEP 2: Process Image Watermark
        # ================================================================
        if watermark_image:
            logger.info("Processing image watermark...")
            
            # Validate image file
            if not watermark_image.content_type or \
               not watermark_image.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {watermark_image.filename} is not a valid image"
                )
            
            # Save to temporary file
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
            
            # Apply image watermark
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                executor,
                add_image_watermark,
                input_path,
                output_path,
                watermark_image_path,
                request.opacity,
                request.x,
                request.y,
                request.width,
                request.height,
                request.rotation,
            )
            
            logger.info("Image watermark applied successfully")
            
        # ================================================================
        # STEP 3: Process Text Watermark
        # ================================================================
        elif request.text:
            logger.info(f"Processing text watermark: '{request.text}'")
            logger.info(f"Font: {request.font or 'Arial'}, Size: {request.font_size}")
            
            # Apply text watermark
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                executor,
                add_text_watermark,
                input_path,
                output_path,
                request.text,
                request.opacity,
                request.font_size,
                request.rotation,
                request.color,
                request.x,
                request.y,
                request.width,
                request.height,
                request.font,  # NEW parameter
            )
            
            logger.info("Text watermark applied successfully")
        
        # ================================================================
        # STEP 4: Validation
        # ================================================================
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'text' or 'watermark_image' must be provided"
            )
        
        # ================================================================
        # STEP 5: Return Result
        # ================================================================
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="watermarked.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Watermark addition failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Watermark addition failed: {str(e)}"
        )
    finally:
        # Cleanup temporary files
        if input_path:
            safe_remove(input_path)
        if watermark_image_path:
            safe_remove(watermark_image_path)