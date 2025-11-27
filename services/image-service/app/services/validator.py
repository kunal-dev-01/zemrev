# File validation

from fastapi import UploadFile, HTTPException
from app.core.config import settings

class Validator:
    @staticmethod
    async def validate_files(files):
        if not files:
            raise HTTPException(400, "No files provided")

        if len(files) > settings.MAX_BATCH_SIZE:
            raise HTTPException(400, f"Max {settings.MAX_BATCH_SIZE} files allowed")

        for file in files:
            if not file.filename:
                raise HTTPException(400, "Missing filename")

            if file.content_type not in settings.INPUT_FORMATS:
                raise HTTPException(400, f"Unsupported type: {file.content_type}")

            content = await file.read()
            await file.seek(0)

            if len(content) == 0:
                raise HTTPException(400, f"{file.filename} is empty")

            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(400, f"{file.filename} exceeds size limit")

validator = Validator()
