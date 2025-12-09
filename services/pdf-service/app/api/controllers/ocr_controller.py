"""
============================================================================
FILE: app/api/controllers/ocr_controller.py
PURPOSE: Controller logic for OCR operations
============================================================================
"""

from pathlib import Path
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio

from app.services.validator import validate_upload
from app.services.ocr.ocr_processor import (
    ocr_pdf_to_searchable,
    extract_text_with_ocr
)
from app.models.ocr_schemas import (
    OcrPdfRequest, ExtractTextOcrRequest, ExtractTextOcrResponse
)
from app.utils.file_io import create_temp_pdf_path, safe_remove
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


async def ocr_pdf_handler(
    file: UploadFile,
    request: OcrPdfRequest
) -> FileResponse:
    """Handle OCR PDF to searchable PDF."""
    input_path = None
    output_path = None
    
    try:
        # Validate upload
        input_path = await validate_upload(file)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="ocr_searchable")
        
        # Run OCR
        loop = asyncio.get_event_loop()
        pages_processed = await loop.run_in_executor(
            executor,
            ocr_pdf_to_searchable,
            input_path,
            output_path,
            request.language,
            request.dpi
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="searchable.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)


async def extract_text_ocr_handler(
    file: UploadFile,
    request: ExtractTextOcrRequest
) -> ExtractTextOcrResponse:
    """Handle text extraction with OCR."""
    input_path = None
    
    try:
        # Validate upload
        input_path = await validate_upload(file)
        
        # Extract text with OCR
        loop = asyncio.get_event_loop()
        text, pages_processed = await loop.run_in_executor(
            executor,
            extract_text_with_ocr,
            input_path,
            request.language,
            request.page_range,
            300  # Default DPI
        )
        
        return ExtractTextOcrResponse(
            text=text,
            pages_processed=pages_processed,
            char_count=len(text),
            language=request.language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR text extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)