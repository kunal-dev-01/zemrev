"""
============================================================================
FILE: services/pdf-service/app/api/controllers/pypdf_controller.py
PURPOSE: Controller logic for PDF operations
============================================================================
"""

from pathlib import Path
from typing import List
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio

from app.services.validator import validate_upload
from app.services.pypdf.merge_service import merge_pdfs
from app.services.pypdf.split_service import split_pdf
from app.services.pypdf.rotate_service import rotate_pdf_pages
from app.services.pypdf.encrypt_service import encrypt_pdf
from app.services.pypdf.decrypt_service import decrypt_pdf
from app.models.pypdf_schemas import (
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
) -> FileResponse:

    input_path = None
    output_paths = []

    try:
        # 1️⃣ Validate and save uploaded file
        input_path = await validate_upload(file)

        # 2️⃣ Parse page ranges
        ranges = parse_page_ranges(request.pages)
        logger.info(f"Split request: {len(ranges)} ranges from {request.pages}")

        # 3️⃣ Run split in thread pool
        loop = asyncio.get_event_loop()
        output_paths = await loop.run_in_executor(
            executor,
            split_pdf,
            input_path,
            ranges,
            Path(input_path.parent)
        )

        logger.info(f"Number of ranges: {len(ranges)}")
        logger.info(f"Number of output PDFs: {len(output_paths)}")
        logger.info(f"Output paths: {output_paths}")

        # ============================================================
        # ✅ CASE 1: Single range → return single PDF
        # ============================================================
        if len(ranges) == 1:
            single_pdf = output_paths[0]
            output_paths = []
            
            return FileResponse(
                path=str(single_pdf),
                media_type="application/pdf",
                filename="split.pdf",
                background=None
            )

        # ============================================================
        # ✅ CASE 2: Multiple ranges → ZIP
        # ============================================================
        zip_path = create_zip_from_pdfs(output_paths, zip_prefix="split")
        
        # Cleanup the original split PDFs
        safe_remove_multiple(output_paths)
        output_paths = []

        # Return ZIP with EXPLICIT headers
        response = FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="split_pages.zip",
            background=None
        )
        # Force correct content type
        response.headers["Content-Type"] = "application/zip"
        response.headers["Content-Disposition"] = 'attachment; filename="split_pages.zip"'

        return response

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Split operation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")

    finally:
        # Cleanup input PDF
        if input_path:
            safe_remove(input_path)
        
        # Cleanup any remaining intermediate PDFs (if error occurred)
        if output_paths:
            safe_remove_multiple(output_paths)



async def rotate_pdf_handler(
    file: UploadFile,
    request: RotateRequest
) -> FileResponse:
    
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