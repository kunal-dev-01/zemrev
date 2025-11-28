# ============================================================================
# FILE: app/services/resizer.py
# PURPOSE: Image resizing with aspect ratio preservation
# COMMIT: feat: add smart resizer with aspect ratio handling
# ============================================================================

import pyvips
from PIL import Image
import io
import logging
from app.models.schemas import ResizeRequest

logger = logging.getLogger(__name__)

class SmartResizer:
    """Smart image resizer"""
    
    @staticmethod
    def resize(
        content: bytes,
        filename: str,
        options: ResizeRequest
    ) -> tuple[bytes, str, tuple[int, int], str]:
        """
        Resize image
        
        Returns:
            tuple: (output_bytes, filename, new_dimensions, engine_used)
        """
        
        try:
            # Try PyVips first (faster, lower memory)
            output, dims = SmartResizer._resize_pyvips(content, options)
            return output, filename, dims, "pyvips"
            
        except Exception as e:
            logger.warning(f"PyVips failed, using Pillow: {e}")
            
            # Fallback to Pillow
            output, dims = SmartResizer._resize_pillow(content, options)
            return output, filename, dims, "pillow"
    
    @staticmethod
    def _resize_pyvips(
        content: bytes,
        options: ResizeRequest
    ) -> tuple[bytes, tuple[int, int]]:
        """Resize using PyVips"""
        
        img = pyvips.Image.new_from_buffer(content, "", access="sequential")
        
        original_width = img.width
        original_height = img.height
        
        # Calculate new dimensions
        if options.width and options.height:
            # Both specified - force dimensions
            new_width = options.width
            new_height = options.height
        elif options.width:
            # Only width - maintain aspect ratio
            scale = options.width / original_width
            new_width = options.width
            new_height = int(original_height * scale)
        elif options.height:
            # Only height - maintain aspect ratio
            scale = options.height / original_height
            new_width = int(original_width * scale)
            new_height = options.height
        else:
            raise ValueError("At least one dimension required")
        
        # Resize
        resized = img.thumbnail_image(
            new_width,
            height=new_height,
            no_rotate=True
        )
        
        # Save in original format
        output = resized.write_to_buffer(".jpg")
        
        return output, (resized.width, resized.height)
    
    @staticmethod
    def _resize_pillow(
        content: bytes,
        options: ResizeRequest
    ) -> tuple[bytes, tuple[int, int]]:
        """Resize using Pillow"""
        
        img = Image.open(io.BytesIO(content))
        
        original_width, original_height = img.size
        
        # Calculate new dimensions
        if options.width and options.height:
            new_size = (options.width, options.height)
        elif options.width:
            scale = options.width / original_width
            new_size = (options.width, int(original_height * scale))
        elif options.height:
            scale = options.height / original_height
            new_size = (int(original_width * scale), options.height)
        else:
            raise ValueError("At least one dimension required")
        
        # Resize with high-quality resampling
        resized = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save
        output_buffer = io.BytesIO()
        
        # Preserve format if possible
        img_format = img.format or "JPEG"
        
        if img_format == "JPEG" and resized.mode == "RGBA":
            resized = resized.convert("RGB")
        
        resized.save(output_buffer, format=img_format, quality=90)
        
        return output_buffer.getvalue(), new_size

# Global instance
resizer = SmartResizer()