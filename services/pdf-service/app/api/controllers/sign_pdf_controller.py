"""
============================================================================
FILE: services/pdf-service/app/api/controllers/sign_pdf_controller.py
PURPOSE: Controller logic for PDF signing with multiple signatures
============================================================================
"""

from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from concurrent.futures import ThreadPoolExecutor
import asyncio
import tempfile
import json

from app.services.validator import validate_upload
from app.services.pymupdf.sign_pdf import sign_pdf
from app.models.pymupdf_schemas import SignPdfRequest, SignatureItem
from app.utils.file_io import create_temp_pdf_path, safe_remove
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)


async def sign_pdf_handler(
    file: UploadFile,
    signatures_json: str,
    signature_image_files: Optional[List[UploadFile]] = None
) -> FileResponse:
    """
    Handle PDF signing with multiple signatures.
    
    Args:
        file: PDF file to sign
        signatures_json: JSON string containing signature data
        signature_image_files: Optional list of image files for image signatures
    
    Returns:
        FileResponse with signed PDF
    
    Raises:
        HTTPException: If validation or processing fails
    """
    input_path = None
    output_path = None
    temp_image_paths = []
    
    try:
        # ====================================================================
        # STEP 1: Validate PDF File
        # ====================================================================
        logger.info("Validating PDF file...")
        input_path = await validate_upload(file)
        output_path = create_temp_pdf_path(prefix="signed")
        
        # ====================================================================
        # STEP 2: Parse Signatures JSON
        # ====================================================================
        logger.info("Parsing signatures JSON...")
        try:
            signatures_data = json.loads(signatures_json)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid signatures_json format: {str(e)}"
            )
        
        # Validate JSON structure
        if not isinstance(signatures_data, list):
            raise HTTPException(
                status_code=400,
                detail="signatures_json must be a JSON array"
            )
        
        if len(signatures_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one signature is required"
            )
        
        if len(signatures_data) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 signatures per PDF"
            )
        
        # ====================================================================
        # STEP 3: Validate Signature Items
        # ====================================================================
        logger.info(f"Validating {len(signatures_data)} signatures...")
        validated_signatures = []
        
        for idx, sig_data in enumerate(signatures_data):
            try:
                # Validate using Pydantic model
                sig = SignatureItem(**sig_data)
                validated_signatures.append(sig)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid signature at index {idx}: {str(e)}"
                )
        
        # ====================================================================
        # STEP 4: Process Image Files
        # ====================================================================
        signature_images = {}
        
        if signature_image_files:
            logger.info(f"Processing {len(signature_image_files)} image files...")
            
            # Get list of image signature IDs in order
            image_signatures = [
                sig for sig in validated_signatures 
                if sig.type == 'image'
            ]
            
            if len(signature_image_files) != len(image_signatures):
                raise HTTPException(
                    status_code=400,
                    detail=f"Expected {len(image_signatures)} image files, "
                           f"got {len(signature_image_files)}"
                )
            
            # Map images to signature IDs
            for idx, img_file in enumerate(signature_image_files):
                if not img_file or not img_file.filename:
                    continue
                
                # Validate image file
                if not img_file.content_type or \
                   not img_file.content_type.startswith('image/'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {img_file.filename} is not a valid image"
                    )
                
                # Save to temporary file
                content = await img_file.read()
                temp_file = tempfile.NamedTemporaryFile(
                    mode='wb',
                    delete=False,
                    suffix=Path(img_file.filename).suffix,
                    dir=settings.UPLOAD_DIR
                )
                temp_file.write(content)
                temp_file.close()
                temp_image_path = Path(temp_file.name)
                temp_image_paths.append(temp_image_path)
                
                # Map to signature ID
                if idx < len(image_signatures):
                    signature_images[image_signatures[idx].id] = temp_image_path
                    logger.info(
                        f"Mapped image {img_file.filename} to "
                        f"signature {image_signatures[idx].id}"
                    )
        
        # ====================================================================
        # STEP 5: Build Signature Data for Processing
        # ====================================================================
        logger.info("Building signature data...")
        signatures_for_processing = []
        
        for sig in validated_signatures:
            sig_dict = {
                'id': sig.id,
                'type': sig.type,
                'x': sig.x,
                'y': sig.y,
                'width': sig.width,
                'height': sig.height,
                'page': sig.page,
            }
            
            if sig.type == 'text':
                sig_dict['text'] = sig.text or 'Signature'
                sig_dict['font'] = sig.font or 'Arial'
            elif sig.type == 'image':
                if sig.id not in signature_images:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Image file missing for signature {sig.id}"
                    )
                sig_dict['image_path'] = str(signature_images[sig.id])
            
            signatures_for_processing.append(sig_dict)
        
        # ====================================================================
        # STEP 6: Process PDF with Signatures
        # ====================================================================
        logger.info(f"Processing PDF with {len(signatures_for_processing)} signatures...")
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor,
            sign_pdf,
            input_path,
            output_path,
            signatures_for_processing
        )
        
        logger.info(f"Successfully signed PDF: {output_path}")
        
        # ====================================================================
        # STEP 7: Return Result
        # ====================================================================
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename="signed.pdf",
            background=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF signing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"PDF signing failed: {str(e)}"
        )
    finally:
        # Cleanup temporary files
        if input_path:
            safe_remove(input_path)
        for temp_path in temp_image_paths:
            safe_remove(temp_path)