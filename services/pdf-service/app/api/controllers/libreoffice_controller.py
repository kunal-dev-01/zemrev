"""
============================================================================
FILE: app/api/controllers/libreoffice_controller.py
PURPOSE: Controller logic for LibreOffice operations
============================================================================
"""

from pathlib import Path
import tempfile
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio

from app.services.libreoffice.document_converter import (
    convert_to_pdf_libreoffice,
    convert_pdf_to_docx_libreoffice
)
from app.services.validator import validate_upload
from app.utils.file_io import safe_remove
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


async def word_to_pdf_handler(file: UploadFile) -> FileResponse:
    """Handle Word to PDF conversion."""
    input_path = None
    output_path = None
    output_dir = None
    
    try:
        # Save uploaded file
        content = await file.read()
        temp_file = tempfile.NamedTemporaryFile(
            mode='wb',
            delete=False,
            suffix=Path(file.filename).suffix,
            dir=settings.UPLOAD_DIR
        )
        temp_file.write(content)
        temp_file.close()
        input_path = Path(temp_file.name)
        
        # Create output directory
        output_dir = Path(tempfile.mkdtemp(dir=settings.UPLOAD_DIR))
        
        # Convert to PDF
        loop = asyncio.get_event_loop()
        output_path = await loop.run_in_executor(
            executor,
            convert_to_pdf_libreoffice,
            input_path,
            output_dir
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename=f"{Path(file.filename).stem}.pdf",
            background=None
        )
        
    except Exception as e:
        logger.error(f"Word to PDF conversion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        if output_dir and output_dir.exists():
            try:
                output_dir.rmdir()
            except:
                pass


async def pdf_to_word_handler(file: UploadFile) -> FileResponse:
    """Handle PDF to Word conversion."""
    input_path = None
    output_path = None
    output_dir = None
    
    try:
        # Validate PDF
        input_path = await validate_upload(file)
        
        # Create output directory
        output_dir = Path(tempfile.mkdtemp(dir=settings.UPLOAD_DIR))
        
        # Convert to DOCX
        loop = asyncio.get_event_loop()
        output_path = await loop.run_in_executor(
            executor,
            convert_pdf_to_docx_libreoffice,
            input_path,
            output_dir
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{Path(file.filename).stem}.docx",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF to Word conversion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        if output_dir and output_dir.exists():
            try:
                output_dir.rmdir()
            except:
                pass


async def generic_to_pdf_handler(file: UploadFile) -> FileResponse:
    """Handle generic document to PDF conversion (HTML, Excel, PowerPoint)."""
    input_path = None
    output_path = None
    output_dir = None
    
    try:
        # Save uploaded file
        content = await file.read()
        temp_file = tempfile.NamedTemporaryFile(
            mode='wb',
            delete=False,
            suffix=Path(file.filename).suffix,
            dir=settings.UPLOAD_DIR
        )
        temp_file.write(content)
        temp_file.close()
        input_path = Path(temp_file.name)
        
        # Create output directory
        output_dir = Path(tempfile.mkdtemp(dir=settings.UPLOAD_DIR))
        
        # Convert to PDF
        loop = asyncio.get_event_loop()
        output_path = await loop.run_in_executor(
            executor,
            convert_to_pdf_libreoffice,
            input_path,
            output_dir
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename=f"{Path(file.filename).stem}.pdf",
            background=None
        )
        
    except Exception as e:
        logger.error(f"Document to PDF conversion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if input_path:
            safe_remove(input_path)
        if output_dir and output_dir.exists():
            try:
                output_dir.rmdir()
            except:
                pass