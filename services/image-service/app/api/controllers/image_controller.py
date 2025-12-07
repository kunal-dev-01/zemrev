"""
============================================================================
FILE: app/api/controllers/image_controller.py
PURPOSE: Business logic for all image operations
============================================================================
"""

from fastapi import UploadFile
from fastapi.responses import Response
from typing import Optional
import logging
from app.models.schemas import *
from app.services.validator import validator
from app.services.url_downloader import url_downloader
from app.services.converter import converter
from app.services.compressor import compressor
from app.services.resizer import resizer
from app.services.optimizer import optimizer
from app.services.cropper import cropper
from app.services.watermark import watermarker
from app.services.metadata import metadata_extractor
from app.services.palette import color_palette_generator

logger = logging.getLogger(__name__)

class ImageController:
    """Controller for image operations"""
    
    # ========================================================================
    # CONVERTER
    # ========================================================================
    
    @staticmethod
    async def convert_image(file: Optional[UploadFile], options: ConvertRequest):
        """Convert image format"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Convert
        try:
            output, new_filename = converter.convert(content, filename, options)
            
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{options.format.value}"
            )
            
        except Exception as e:
            logger.error(f"Convert failed: {e}")
            raise
    
    # ========================================================================
    # COMPRESSOR
    # ========================================================================
    
    @staticmethod
    async def compress_image(file: Optional[UploadFile], options: CompressRequest):
        """Compress image"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Compress
        try:
            output, new_filename = compressor.compress(content, filename, options)
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Compress failed: {e}")
            raise
    
    # ========================================================================
    # RESIZER
    # ========================================================================
    
    @staticmethod
    async def resize_image(file: Optional[UploadFile], options: ResizeRequest):
        """Resize image"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Resize
        try:
            output, new_filename, dims = resizer.resize(content, filename, options)
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Resize failed: {e}")
            raise
    
    # ========================================================================
    # OPTIMIZER
    # ========================================================================
    
    @staticmethod
    async def optimize_image(file: Optional[UploadFile], options: OptimizeRequest):
        """Optimize image"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Optimize
        try:
            output, new_filename = optimizer.optimize(content, filename, options)
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Optimize failed: {e}")
            raise
    
    # ========================================================================
    # CROPPER
    # ========================================================================
    
    @staticmethod
    async def crop_image(file: Optional[UploadFile], options: CropRequest):
        """Crop image"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Crop
        try:
            output, new_filename = cropper.crop(content, filename, options)
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Crop failed: {e}")
            raise
    
    # ========================================================================
    # WATERMARK TEXT
    # ========================================================================
    
    @staticmethod
    async def add_text_watermark(file: Optional[UploadFile], options: TextWatermarkRequest):
        """Add text watermark"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Add watermark
        try:
            output, new_filename = watermarker.add_text_watermark(content, filename, options)
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Text watermark failed: {e}")
            raise
    
    # ========================================================================
    # WATERMARK IMAGE
    # ========================================================================
    
    @staticmethod
    async def add_image_watermark(
        file: Optional[UploadFile],
        watermark: UploadFile,
        options: ImageWatermarkRequest
    ):
        """Add image watermark"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Validate watermark
        watermark_content = await validator.validate_file(watermark)
        
        # Add watermark
        try:
            output, new_filename = watermarker.add_image_watermark(
                content, watermark_content, filename, options
            )
            
            ext = new_filename.rsplit(".", 1)[-1]
            return ImageController._single_response(
                output,
                new_filename,
                f"image/{ext}"
            )
            
        except Exception as e:
            logger.error(f"Image watermark failed: {e}")
            raise


    # ========================================================================
    # IMAGE FILTER
    # ========================================================================
    
    @staticmethod
    async def extract_metadata(file: Optional[UploadFile], options: MetadataRequest):
        """Extract image metadata"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Extract metadata
        try:
            metadata = metadata_extractor.extract_metadata(content, filename)
            
            from fastapi.responses import JSONResponse
            
            return JSONResponse(
                content={
                    "success": True,
                    "filename": filename,
                    "metadata": metadata
                }
            )
            
        except Exception as e:
            logger.error(f"Metadata extraction failed: {e}")
            raise
    
    # ========================================================================
    # COLOR PALETTE
    # ========================================================================
    
    @staticmethod
    async def extract_palette(file: Optional[UploadFile], options: PaletteRequest):
        """Extract color palette"""
        
        # Handle URL or file upload
        if options.url:
            content, filename = await url_downloader.download(str(options.url))
        else:
            content = await validator.validate_file(file)
            filename = file.filename
        
        # Extract palette
        try:
            palette_data, preview_bytes, preview_filename = color_palette_generator.extract_palette(
                content, filename, options.num_colors
            )
            
            # Return JSON response with palette data and preview image reference
            from fastapi.responses import JSONResponse
            
            # Add preview image as base64 for easy display
            import base64
            preview_base64 = base64.b64encode(preview_bytes).decode('utf-8')
            
            return JSONResponse(
                content={
                    "success": True,
                    "filename": filename,
                    "palette": palette_data["palette"],
                    "total_colors": palette_data["total_colors"],
                    "preview_image": {
                        "filename": preview_filename,
                        "data": f"data:image/png;base64,{preview_base64}",
                        "size": len(preview_bytes)
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Palette extraction failed: {e}")
            raise

    
    # ========================================================================
    # HELPER
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

image_controller = ImageController()