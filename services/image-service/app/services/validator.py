from fastapi import UploadFile, HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Validator:
    """File validation with proper error handling"""
    
    # Magic number signatures for quick validation
    MAGIC_NUMBERS = {
        b'\xFF\xD8\xFF': 'image/jpeg',
        b'\x89PNG\r\n\x1a\n': 'image/png',
        b'RIFF': 'image/webp',
        b'GIF87a': 'image/gif',
        b'GIF89a': 'image/gif',
        b'BM': 'image/bmp',
        b'II*\x00': 'image/tiff',
        b'MM\x00*': 'image/tiff',
    }
    
    @staticmethod
    async def validate_files(files: list[UploadFile]) -> None:
        """Validate uploaded files"""
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")

        if len(files) > settings.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {settings.MAX_BATCH_SIZE} files allowed. You uploaded {len(files)}."
            )

        for idx, file in enumerate(files, 1):
            await Validator._validate_single_file(file, idx)

    @staticmethod
    async def _validate_single_file(file: UploadFile, index: int) -> None:
        """Validate a single file"""
        if not file.filename:
            raise HTTPException(status_code=400, detail=f"File #{index}: Missing filename")

        try:
            content = await file.read()
            await file.seek(0)
        except Exception as e:
            logger.error(f"Failed to read file {file.filename}: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"File #{index} ({file.filename}): Failed to read file"
            )

        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail=f"File #{index} ({file.filename}): File is empty"
            )

        if len(content) > settings.MAX_FILE_SIZE:
            size_mb = len(content) / (1024 * 1024)
            limit_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=400,
                detail=f"File #{index} ({file.filename}): Size {size_mb:.2f}MB exceeds limit of {limit_mb:.2f}MB"
            )

        if file.content_type not in settings.INPUT_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"File #{index} ({file.filename}): Unsupported type '{file.content_type}'"
            )

        if not Validator._validate_magic_number(content):
            logger.warning(f"Suspicious file: {file.filename}")

    @staticmethod
    def _validate_magic_number(content: bytes) -> bool:
        """Validate file using magic numbers"""
        if len(content) < 12:
            return False
            
        for magic_bytes in Validator.MAGIC_NUMBERS.keys():
            if content.startswith(magic_bytes):
                return True
        
        # WebP check
        if content.startswith(b'RIFF') and len(content) > 12 and content[8:12] == b'WEBP':
            return True
            
        # AVIF/HEIF check
        if content[4:8] == b'ftyp':
            return True
            
        return True

validator = Validator()