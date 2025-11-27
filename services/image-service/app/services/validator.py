from fastapi import UploadFile, HTTPException
from app.core.config import settings
from typing import List
import logging

logger = logging.getLogger(__name__)

class Validator:
    """Input validation for uploaded files"""
    
    @staticmethod
    async def validate_files(files: List[UploadFile]):
        """
        Validate uploaded files against size and type constraints
        
        Raises:
            HTTPException: If validation fails
        """
        
        # Check if files provided
        if not files or len(files) == 0:
            raise HTTPException(
                status_code=400,
                detail="No files provided. Upload at least 1 image."
            )
        
        # Check batch size limit
        if len(files) > settings.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {settings.MAX_BATCH_SIZE} files allowed per batch. You uploaded {len(files)}."
            )
        
        # Validate each file
        for idx, file in enumerate(files):
            # Check if file has content
            if not file.filename:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {idx + 1} has no filename"
                )
            
            # Check MIME type
            if file.content_type not in settings.INPUT_FORMATS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file.content_type}. File: {file.filename}"
                )
            
            # Read and validate file size
            content = await file.read()
            file_size = len(content)
            
            # Reset file pointer for later reading
            await file.seek(0)
            
            if file_size == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is empty (0 bytes)"
                )
            
            if file_size > settings.MAX_FILE_SIZE:
                max_mb = settings.MAX_FILE_SIZE / 1024 / 1024
                actual_mb = file_size / 1024 / 1024
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} exceeds {max_mb:.0f}MB limit (actual: {actual_mb:.1f}MB)"
                )
            
            logger.debug(f"Validated {file.filename}: {file_size} bytes, {file.content_type}")
        
        return True

validator = Validator()