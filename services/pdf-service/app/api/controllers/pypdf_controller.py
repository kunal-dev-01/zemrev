"""
============================================================================
FILE: app/api/controllers/pypdf_controller.py
PURPOSE: Controller logic for PDF operations
============================================================================
"""

from pathlib import Path
from typing import List
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio

from app.services.validator import validate_upload
from app.services.merge_service import merge_pdfs
from app.services.split_service import split_pdf
from app.services.rotate_service import rotate_pdf_pages
from app.services.encrypt_service import encrypt_pdf
from app.services.decrypt_service import decrypt_pdf
from app.models.schemas import (
    SplitRequest, RotateRequest, EncryptRequest, DecryptRequest,
    parse_page_ranges, parse_rotations
)
from app.utils.file_io import (
    create_temp_pdf_path, safe_remove, safe_remove_multiple,
    create_zip_from_pdfs
)
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking PDF operations (limit to 2 workers for VPS)
executor = ThreadPoolExecutor(max_workers=2)


async def merge_pdfs_handler(files: List[UploadFile]) -> FileResponse:
    """
    Handle PDF merge request.
    
    Args:
        files: List of uploaded PDF files (minimum 2)
        
    Returns:
        FileResponse with merged PDF
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files required for merging"
        )
    
    temp_paths = []
    output_path = None
    
    try:
        # Validate and save all uploaded files
        for file in files:
            temp_path = await validate_upload(file)
            temp_paths.append(temp_path)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="merged")
        
        # Run merge in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            merge_pdfs,
            temp_paths,
            output_path
        )
        
        # Return merged PDF
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="merged.pdf",
            background=None  # We'll handle cleanup manually
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Merge operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")
    finally:
        # Cleanup input files (output handled by caller)
        safe_remove_multiple(temp_paths)


async def split_pdf_handler(
    file: UploadFile,
    request: SplitRequest
) -> StreamingResponse:
    """
    Handle PDF split request.
    
    Args:
        file: Uploaded PDF file
        request: Split request with page ranges
        
    Returns:
        StreamingResponse with ZIP containing split PDFs
    """
    input_path = None
    output_paths = []
    zip_path = None
    
    try:
        # Validate and save uploaded file
        input_path = await validate_upload(file)
        
        # Parse page ranges
        ranges = parse_page_ranges(request.pages)
        logger.info(f"Split request: {len(ranges)} ranges from {request.pages}")
        
        # Create output directory (use settings.UPLOAD_DIR)
        output_dir = Path(input_path.parent)
        
        # Run split in thread pool
        loop = asyncio.get_event_loop()
        output_paths = await loop.run_in_executor(
            executor,
            split_pdf,
            input_path,
            ranges,
            output_dir
        )
        
        # Create ZIP archive
        zip_path = create_zip_from_pdfs(output_paths, zip_prefix="split")
        
        # Return ZIP file as streaming response
        def iterfile():
            with open(zip_path, 'rb') as f:
                yield from f
        
        return StreamingResponse(
            iterfile(),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=split_pages.zip"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Split operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")
    finally:
        # Cleanup
        if input_path:
            safe_remove(input_path)
        safe_remove_multiple(output_paths)
        if zip_path:
            safe_remove(zip_path)


async def rotate_pdf_handler(
    file: UploadFile,
    request: RotateRequest
) -> FileResponse:
    """
    Handle PDF rotation request.
    
    Args:
        file: Uploaded PDF file
        request: Rotation request
        
    Returns:
        FileResponse with rotated PDF
    """
    input_path = None
    output_path = None
    
    try:
        # Validate and save uploaded file
        input_path = await validate_upload(file)
        
        # Parse rotations
        rotations = parse_rotations(request.rotations)
        logger.info(f"Rotate request: {len(rotations)} pages from {request.rotations}")
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="rotated")
        
        # Run rotation in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            rotate_pdf_pages,
            input_path,
            rotations,
            output_path
        )
        
        # Return rotated PDF
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="rotated.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rotate operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Rotation failed: {str(e)}")
    finally:
        # Cleanup input
        if input_path:
            safe_remove(input_path)


async def encrypt_pdf_handler(
    file: UploadFile,
    request: EncryptRequest
) -> FileResponse:
    """
    Handle PDF encryption request.
    
    Args:
        file: Uploaded PDF file
        request: Encryption request
        
    Returns:
        FileResponse with encrypted PDF
    """
    input_path = None
    output_path = None
    
    try:
        # Validate and save uploaded file
        input_path = await validate_upload(file)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="encrypted")
        
        # Run encryption in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            encrypt_pdf,
            input_path,
            output_path,
            request.user_password,
            request.owner_password
        )
        
        # Return encrypted PDF
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="encrypted.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Encrypt operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")
    finally:
        # Cleanup input
        if input_path:
            safe_remove(input_path)


async def decrypt_pdf_handler(
    file: UploadFile,
    request: DecryptRequest
) -> FileResponse:
    """
    Handle PDF decryption request.
    
    Args:
        file: Uploaded PDF file
        request: Decryption request
        
    Returns:
        FileResponse with decrypted PDF
    """
    input_path = None
    output_path = None
    
    try:
        # Validate and save uploaded file
        input_path = await validate_upload(file)
        
        # Create output path
        output_path = create_temp_pdf_path(prefix="decrypted")
        
        # Run decryption in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            decrypt_pdf,
            input_path,
            output_path,
            request.password
        )
        
        # Return decrypted PDF
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="decrypted.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        # Handle wrong password
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Decrypt operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")
    finally:
        # Cleanup input
        if input_path:
            safe_remove(input_path)