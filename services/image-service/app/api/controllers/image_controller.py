# Image Conversion Controller

from fastapi import UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
from app.models.schemas import ConversionRequest
from app.services.validator import validator
from app.services.converter import converter
from app.core.config import settings
import io
import zipfile
import logging

logger = logging.getLogger(__name__)

class ImageController:
    # Convert images
    @staticmethod
    async def convert_images(files, format, quality, width, height):
        await validator.validate_files(files)

        if format not in settings.OUTPUT_FORMATS:
            raise HTTPException(400, f"Invalid format. Allowed: {', '.join(settings.OUTPUT_FORMATS)}")

        options = ConversionRequest(format=format, quality=quality, width=width, height=height)

        converted = []
        total_original = 0
        total_converted = 0

        for file in files:
            try:
                content = await file.read()
                original_size = len(content)
                total_original += original_size

                output, new_name = converter.convert(content, file.filename, options)
                converted_size = len(output)
                total_converted += converted_size

                ratio = ((original_size - converted_size) / original_size) * 100

                converted.append({
                    "filename": new_name,
                    "data": output,
                    "original_size": original_size,
                    "converted_size": converted_size,
                    "compression_ratio": ratio
                })

            except Exception as e:
                raise HTTPException(500, f"Failed to convert {file.filename}: {str(e)}")

        if len(converted) == 1:
            file = converted[0]
            return Response(
                content=file["data"],
                media_type=f"image/{options.format}",
                headers={
                    "Content-Disposition": f'attachment; filename="{file["filename"]}"',
                    "X-Original-Size": str(file["original_size"]),
                    "X-Converted-Size": str(file["converted_size"]),
                    "X-Compression-Ratio": f'{file["compression_ratio"]:.2f}%'
                }
            )

        # Multiple files → ZIP
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zip_file:
            for f in converted:
                zip_file.writestr(f["filename"], f["data"])

        zip_buffer.seek(0)
        overall = ((total_original - total_converted) / total_original) * 100

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=converted_images.zip",
                "X-File-Count": str(len(converted)),
                "X-Total-Original-Size": str(total_original),
                "X-Total-Converted-Size": str(total_converted),
                "X-Overall-Compression": f"{overall:.2f}%"
            }
        )

    # Supported formats
    @staticmethod
    async def get_formats():
        return {
            "input_formats": {
                "common": ["JPG/JPEG", "PNG", "WebP", "AVIF"],
                "professional": ["TIFF", "BMP"],
                "mobile": ["HEIC/HEIF"],
                "graphics": ["GIF (first frame)", "SVG (basic)"],
                "advanced": ["PPM", "PGM", "PBM", "HDR", "FITS"]
            },
            "output_formats": settings.OUTPUT_FORMATS,
            "notes": {
                "gif": "Only first frame extracted",
                "svg": "Basic rasterization only",
                "quality": "Ignored for PNG, GIF, PPM"
            }
        }
