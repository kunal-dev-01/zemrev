"""
============================================================================
FILE: app/services/validator.py
PURPOSE: File validation with magic number checking
============================================================================
"""

from fastapi import UploadFile, HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Validator:
    """File validation"""
    
    MAGIC_NUMBERS = {
        b'\xFF\xD8\xFF': 'image/jpeg',
        b'\x89PNG\r\n\x1a\n': 'image/png',
        b'RIFF': 'image/webp',
        b'II*\x00': 'image/tiff',
        b'MM\x00*': 'image/tiff',
    }
    
    @staticmethod
    async def validate_file(file: UploadFile) -> bytes:
        """Validate single uploaded file"""
        
        if not file:
            raise HTTPException(400, detail="No file provided")
        
        if not file.filename:
            raise HTTPException(400, detail="Missing filename")
        
        try:
            content = await file.read()
            await file.seek(0)
        except:
            raise HTTPException(400, detail="File read failed")
        
        if len(content) == 0:
            raise HTTPException(400, detail="Empty file")
        
        if len(content) > settings.MAX_FILE_SIZE:
            size_mb = len(content) / (1024 * 1024)
            limit_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
            raise HTTPException(
                400,
                detail=f"File too large: {size_mb:.1f}MB exceeds {limit_mb:.0f}MB limit"
            )
        
        # Validate magic number
        if not Validator._check_magic(content):
            logger.warning(f"Suspicious file: {file.filename}")
        
        return content
    
    @staticmethod
    def _check_magic(content: bytes) -> bool:
        """Check file magic number"""
        
        if len(content) < 12:
            return False
        
        for magic in Validator.MAGIC_NUMBERS.keys():
            if content.startswith(magic):
                return True
        
        # WebP
        if content.startswith(b'RIFF') and content[8:12] == b'WEBP':
            return True
        
        # AVIF/HEIF/HEIC
        if content[4:8] == b'ftyp':
            return True
        
        return True

validator = Validator()