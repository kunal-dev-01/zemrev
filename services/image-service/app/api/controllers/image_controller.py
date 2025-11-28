# ============================================================================
# FILE: app/api/controllers/image_controller.py
# PURPOSE: Business logic for all image operations
# COMMIT: feat: add controller for convert/compress/resize operations
# ============================================================================

from fastapi import UploadFile
from fastapi.responses import Response, StreamingResponse
from typing import List, Optional
import io
import zipfile
import logging
from app.models.schemas import *
from app.services.validator import validator
from app.services.url_downloader import url_downloader
from app.services.converter import converter
from app.services.compressor import compressor
from app.services.resizer import resizer
from app.services.format_detector import format_detector

logger = logging.getLogger(__name__)

class ImageController:
    """Controller for image operations"""
    
    # ========================================================================
    # CONVERTER
    # ========================================================================
    
    @staticmethod
    async def convert_images(
        files: Optional[List[UploadFile]],
        options: ConvertRequest
    ):
        """Convert image format"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
            files_data = [(content, filename)]
        else:
            await validator.validate_files(files)
            files_data = []
            for file in files:
                content = await file.read()
                files_data.append((content, file.filename))
        
        # Process files
        results = []
        
        for content, filename in files_data:
            try:
                output, new_name, engine = converter.convert(
                    content, filename, options
                )
                
                results.append({
                    "filename": new_name,
                    "data": output,
                    "original_size": len(content),
                    "converted_size": len(output),
                    "engine": engine
                })
                
            except Exception as e:
                logger.error(f"Convert failed {filename}: {e}")
                raise
        
        # Return response
        if len(results) == 1:
            return ImageController._single_response(
                results[0]["data"],
                results[0]["filename"],
                f"image/{options.format.value}"
            )
        else:
            return ImageController._zip_response(results)
    
    # ========================================================================
    # COMPRESSOR
    # ========================================================================
    
    @staticmethod
    async def compress_images(
        files: Optional[List[UploadFile]],
        options: CompressRequest
    ):
        """Compress images"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
            files_data = [(content, filename)]
        else:
            await validator.validate_files(files)
            files_data = []
            for file in files:
                content = await file.read()
                files_data.append((content, file.filename))
        
        # Process files
        results = []
        
        for content, filename in files_data:
            try:
                output, new_name, engine = compressor.compress(
                    content, filename, options
                )
                
                results.append({
                    "filename": new_name,
                    "data": output,
                    "original_size": len(content),
                    "compressed_size": len(output),
                    "engine": engine
                })
                
            except Exception as e:
                logger.error(f"Compress failed {filename}: {e}")
                raise
        
        # Return response
        if len(results) == 1:
            ext = results[0]["filename"].rsplit(".", 1)[-1]
            return ImageController._single_response(
                results[0]["data"],
                results[0]["filename"],
                f"image/{ext}"
            )
        else:
            return ImageController._zip_response(results)
    
    # ========================================================================
    # RESIZER
    # ========================================================================
    
    @staticmethod
    async def resize_images(
        files: Optional[List[UploadFile]],
        options: ResizeRequest
    ):
        """Resize images"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
            files_data = [(content, filename)]
        else:
            await validator.validate_files(files)
            files_data = []
            for file in files:
                content = await file.read()
                files_data.append((content, file.filename))
        
        # Process files
        results = []
        
        for content, filename in files_data:
            try:
                output, new_name, dims, engine = resizer.resize(
                    content, filename, options
                )
                
                results.append({
                    "filename": new_name,
                    "data": output,
                    "original_size": len(content),
                    "resized_size": len(output),
                    "engine": engine
                })
                
            except Exception as e:
                logger.error(f"Resize failed {filename}: {e}")
                raise
        
        # Return response
        if len(results) == 1:
            ext = results[0]["filename"].rsplit(".", 1)[-1]
            return ImageController._single_response(
                results[0]["data"],
                results[0]["filename"],
                f"image/{ext}"
            )
        else:
            return ImageController._zip_response(results)
    
    # ========================================================================
    # FORMATS INFO
    # ========================================================================
    
    @staticmethod
    async def get_formats():
        """Get supported formats"""
        
        info = format_detector.detect_all()
        
        return FormatsResponse(
            pyvips_formats=info["pyvips"],
            pillow_formats=info["pillow"],
            all_formats=info["all"],
            total=info["total"]
        )
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    @staticmethod
    def _single_response(data: bytes, filename: str, media_type: str) -> Response:
        """Return single file"""
        
        return Response(
            content=data,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Cache-Control": "no-cache"
            }
        )
    
    @staticmethod
    def _zip_response(results: List[dict]) -> StreamingResponse:
        """Return ZIP archive"""
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for result in results:
                zip_file.writestr(result["filename"], result["data"])
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=converted.zip",
                "Cache-Control": "no-cache"
            }
        )