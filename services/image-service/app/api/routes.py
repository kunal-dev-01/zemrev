from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from typing import List
from app.models.schemas import ConversionRequest, ConversionResponse
from app.services.validator import validator
from app.services.converter import converter
from app.core.rate_limiter import rate_limiter
from app.core.config import settings
import io
import zipfile
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Image Conversion"])

async def rate_limit_check(request):
    """Dependency for rate limiting"""
    await rate_limiter.check_rate_limit(request)

@router.post(
    "/convert",
    response_class=Response,
    summary="Convert images",
    description="Convert 1-2 images to specified format. Returns single file or ZIP for batch.",
    responses={
        200: {"description": "Conversion successful - returns image or ZIP"},
        400: {"description": "Invalid input (file size, type, or batch limit)"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Conversion failed"}
    }
)
async def convert_images(
    request,
    files: List[UploadFile] = File(..., description="Upload 1-2 images (max 50MB each)"),
    format: str = Query(default="webp", description="Output format"),
    quality: int = Query(default=85, ge=1, le=100, description="Quality 1-100"),
    width: int | None = Query(default=None, ge=1, le=10000, description="Resize width (optional)"),
    height: int | None = Query(default=None, ge=1, le=10000, description="Resize height (optional)"),
    _: None = Depends(rate_limit_check)
):
    """
    Convert uploaded images to specified format
    
    **Features:**
    - Batch processing (up to 2 images)
    - In-memory conversion (insane fast)
    - Multiple format support
    - Optional resizing
    - Zero storage cost
    
    **Supported Input:** JPG, PNG, WebP, AVIF, TIFF, GIF, BMP, HEIC, SVG
    
    **Supported Output:** WebP, AVIF, JPEG, PNG, TIFF, GIF, BMP, HEIF, PPM
    """
    
    logger.info(f"Conversion request: {len(files)} files → {format} (Q{quality})")
    
    # Validate input files
    await validator.validate_files(files)
    
    # Validate output format
    if format not in settings.OUTPUT_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid output format. Supported: {', '.join(settings.OUTPUT_FORMATS)}"
        )
    
    # Create conversion options
    options = ConversionRequest(
        format=format,
        quality=quality,
        width=width,
        height=height
    )
    
    converted_files = []
    total_original_size = 0
    total_converted_size = 0
    
    # Convert each file
    for file in files:
        try:
            # Read file content into memory
            content = await file.read()
            original_size = len(content)
            total_original_size += original_size
            
            # Convert using PyVips
            output_buffer, new_filename = converter.convert(
                content,
                file.filename,
                options
            )
            
            converted_size = len(output_buffer)
            total_converted_size += converted_size
            compression_ratio = ((original_size - converted_size) / original_size) * 100
            
            converted_files.append({
                "filename": new_filename,
                "data": output_buffer,
                "original_size": original_size,
                "converted_size": converted_size,
                "compression_ratio": compression_ratio
            })
            
            logger.info(f"✓ {file.filename} → {new_filename} ({compression_ratio:.1f}% reduction)")
            
        except Exception as e:
            logger.error(f"Failed to convert {file.filename}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to convert {file.filename}: {str(e)}"
            )
    
    # Return response based on file count
    if len(converted_files) == 1:
        # Single file - direct download
        file_data = converted_files[0]
        
        return Response(
            content=file_data["data"],
            media_type=f"image/{options.format}" if options.format != "ppm" else "image/x-portable-pixmap",
            headers={
                "Content-Disposition": f'attachment; filename="{file_data["filename"]}"',
                "X-Original-Size": str(file_data["original_size"]),
                "X-Converted-Size": str(file_data["converted_size"]),
                "X-Compression-Ratio": f"{file_data['compression_ratio']:.2f}%"
            }
        )
    
    else:
        # Multiple files - create ZIP in memory
        logger.info(f"Creating ZIP with {len(converted_files)} files")
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zip_file:
            for file_data in converted_files:
                zip_file.writestr(file_data["filename"], file_data["data"])
        
        zip_buffer.seek(0)
        zip_size = len(zip_buffer.getvalue())
        
        overall_compression = ((total_original_size - total_converted_size) / total_original_size) * 100
        
        logger.info(f"ZIP created: {zip_size} bytes (overall {overall_compression:.1f}% reduction)")
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=converted_images.zip",
                "X-File-Count": str(len(converted_files)),
                "X-Total-Original-Size": str(total_original_size),
                "X-Total-Converted-Size": str(total_converted_size),
                "X-Overall-Compression": f"{overall_compression:.2f}%"
            }
        )

@router.get(
    "/formats",
    summary="Get supported formats",
    description="List all supported input and output image formats"
)
async def get_supported_formats():
    """
    Get list of all supported image formats
    
    Returns input formats (what you can upload) and output formats (what you can convert to)
    """
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
            "gif": "Only first frame is extracted (no animation support)",
            "svg": "Basic SVGs only - rasterized to specified dimensions",
            "quality": "Quality parameter (1-100) ignored for PNG, GIF, and PPM"
        }
    }