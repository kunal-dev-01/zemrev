from fastapi import UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
from app.models.schemas import ConversionRequest
from app.services.validator import validator
from app.services.converter import converter
from app.services.format_checker import format_checker
from app.core.config import settings
import io
import zipfile
import logging
from typing import List

logger = logging.getLogger(__name__)

class ImageController:
    """Optimized image conversion controller"""
    
    @staticmethod
    async def convert_images(
        files: List[UploadFile],
        format: str,
        quality: int,
        width: int = None,
        height: int = None
    ):
        """
        Convert multiple images with proper error handling
        
        Args:
            files: List of uploaded images
            format: Output format
            quality: Compression quality (1-100)
            width: Optional resize width
            height: Optional resize height
            
        Returns:
            Response or StreamingResponse with converted image(s)
        """
        # Validate files first
        await validator.validate_files(files)

        # Validate format - check if actually supported
        supported_formats = format_checker.get_supported_output_formats()
        
        if format not in supported_formats:
            unsupported = format_checker.get_unsupported_formats()
            error_msg = f"Format '{format}' is not supported on this system. "
            
            # Find specific error for this format
            format_error = next(
                (item for item in unsupported if item["format"] == format),
                None
            )
            
            if format_error:
                error_msg += f"Reason: {format_error['error']}. "
            
            error_msg += f"Supported formats: {', '.join(supported_formats)}"
            
            raise HTTPException(status_code=400, detail=error_msg)

        # Create conversion options
        options = ConversionRequest(
            format=format,
            quality=quality,
            width=width,
            height=height
        )

        # Process files
        converted_files = []
        total_original_size = 0
        total_converted_size = 0
        errors = []

        for file in files:
            try:
                # Read file content
                content = await file.read()
                original_size = len(content)
                total_original_size += original_size

                # Convert image
                output_buffer, new_filename = converter.convert(
                    content,
                    file.filename,
                    options
                )
                
                converted_size = len(output_buffer)
                total_converted_size += converted_size

                # Calculate compression ratio
                compression_ratio = ((original_size - converted_size) / original_size) * 100 if original_size > 0 else 0

                converted_files.append({
                    "filename": new_filename,
                    "data": output_buffer,
                    "original_size": original_size,
                    "converted_size": converted_size,
                    "compression_ratio": compression_ratio
                })

                logger.info(
                    f"Converted {file.filename} -> {new_filename}: "
                    f"{original_size} -> {converted_size} bytes "
                    f"({compression_ratio:.1f}% reduction)"
                )

            except Exception as e:
                error_msg = f"Failed to convert {file.filename}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # Handle errors
        if not converted_files:
            raise HTTPException(
                status_code=500,
                detail=f"All conversions failed. Errors: {'; '.join(errors)}"
            )

        if errors:
            logger.warning(f"Some conversions failed: {errors}")

        # Return single file or ZIP
        if len(converted_files) == 1:
            return ImageController._single_file_response(converted_files[0], options)
        else:
            return ImageController._zip_response(
                converted_files,
                total_original_size,
                total_converted_size
            )

    @staticmethod
    def _single_file_response(file_data: dict, options: ConversionRequest) -> Response:
        """
        Return single converted file
        
        Args:
            file_data: Converted file information
            options: Conversion options
            
        Returns:
            Response with image data
        """
        return Response(
            content=file_data["data"],
            media_type=f"image/{options.format}",
            headers={
                "Content-Disposition": f'attachment; filename="{file_data["filename"]}"',
                "X-Original-Size": str(file_data["original_size"]),
                "X-Converted-Size": str(file_data["converted_size"]),
                "X-Compression-Ratio": f'{file_data["compression_ratio"]:.2f}%',
                "Cache-Control": "no-cache"
            }
        )

    @staticmethod
    def _zip_response(
        converted_files: List[dict],
        total_original: int,
        total_converted: int
    ) -> StreamingResponse:
        """
        Create ZIP archive for multiple files
        
        Args:
            converted_files: List of converted file data
            total_original: Total original size in bytes
            total_converted: Total converted size in bytes
            
        Returns:
            StreamingResponse with ZIP file
        """
        # Create in-memory ZIP
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zip_file:
            for file_data in converted_files:
                zip_file.writestr(
                    file_data["filename"],
                    file_data["data"]
                )

        zip_buffer.seek(0)

        # Calculate overall compression
        overall_compression = ((total_original - total_converted) / total_original) * 100 if total_original > 0 else 0

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=converted_images.zip",
                "X-File-Count": str(len(converted_files)),
                "X-Total-Original-Size": str(total_original),
                "X-Total-Converted-Size": str(total_converted),
                "X-Overall-Compression": f"{overall_compression:.2f}%",
                "Cache-Control": "no-cache"
            }
        )

    @staticmethod
    async def get_formats():
        """
        Get supported input and output formats (dynamically checked)
        
        Returns:
            dict: Format information with actual system support
        """
        format_info = format_checker.check_all_formats()
        supported = format_info["output"]["supported"]
        unsupported = format_info["output"]["unsupported"]
        
        return {
            "input_formats": {
                "common": ["JPEG/JPG", "PNG", "WebP", "AVIF"],
                "professional": ["TIFF", "BMP"],
                "mobile": ["HEIC/HEIF"],
                "graphics": ["GIF (first frame)", "SVG (basic rasterization)"],
                "advanced": ["PPM", "PGM", "PBM", "HDR", "FITS"]
            },
            "output_formats": {
                "supported": supported,
                "unsupported": [item["format"] for item in unsupported]
            },
            "system_info": {
                "libvips_version": format_info.get("libvips_version", "unknown"),
                "total_supported": len(supported),
                "total_unsupported": len(unsupported)
            },
            "unsupported_reasons": unsupported if unsupported else [],
            "constraints": {
                "max_file_size": f"{settings.MAX_FILE_SIZE / (1024*1024):.0f}MB",
                "max_batch_size": settings.MAX_BATCH_SIZE,
                "quality_range": "1-100 (ignored for PNG, GIF, PPM)"
            },
            "notes": {
                "gif": "Only first frame is extracted",
                "svg": "Basic rasterization only",
                "resize": "Maintains aspect ratio by default",
                "quality": "Higher quality = larger file size",
                "avif": "Requires libheif with AV1 encoder support" if "avif" not in supported else "Fully supported"
            }
        }