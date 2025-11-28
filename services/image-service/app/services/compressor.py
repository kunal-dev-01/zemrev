# ============================================================================
# FILE: app/services/compressor.py
# PURPOSE: Smart image compression with quality presets
# COMMIT: feat: add intelligent compressor with quality levels
# ============================================================================

import pyvips
from PIL import Image
import io
import logging
from app.models.schemas import CompressRequest, CompressionLevel

logger = logging.getLogger(__name__)

class SmartCompressor:
    """Smart image compressor"""
    
    # Quality presets
    QUALITY_MAP = {
        CompressionLevel.LOW: 90,
        CompressionLevel.MEDIUM: 80,
        CompressionLevel.HIGH: 70,
        CompressionLevel.MAXIMUM: 60
    }
    
    @staticmethod
    def compress(
        content: bytes,
        filename: str,
        options: CompressRequest
    ) -> tuple[bytes, str, str]:
        """
        Compress image
        
        Returns:
            tuple: (output_bytes, filename, engine_used)
        """
        
        # Get quality
        quality = options.quality or SmartCompressor.QUALITY_MAP[options.level]
        
        # Detect current format
        current_format = SmartCompressor._detect_format(filename)
        
        # Target format
        if options.keep_format:
            target_format = current_format
        else:
            target_format = "webp"  # Convert to WebP for best compression
        
        try:
            # Try PyVips first
            output = SmartCompressor._compress_pyvips(
                content, target_format, quality
            )
            return output, filename, "pyvips"
            
        except Exception as e:
            logger.warning(f"PyVips failed, using Pillow: {e}")
            
            # Fallback to Pillow
            output = SmartCompressor._compress_pillow(
                content, target_format, quality
            )
            return output, filename, "pillow"
    
    @staticmethod
    def _compress_pyvips(
        content: bytes,
        format: str,
        quality: int
    ) -> bytes:
        """Compress using PyVips"""
        
        img = pyvips.Image.new_from_buffer(content, "", access="sequential")
        
        if format == "jpeg" or format == "jpg":
            return img.jpegsave_buffer(Q=quality, strip=True, optimize_coding=True)
        elif format == "png":
            return img.pngsave_buffer(compression=9, strip=True)
        elif format == "webp":
            return img.webpsave_buffer(Q=quality, strip=True, effort=6)
        elif format == "tiff":
            return img.tiffsave_buffer(Q=quality, compression="lzw")
        elif format == "avif":
            return img.heifsave_buffer(Q=quality, compression="av1")
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    @staticmethod
    def _compress_pillow(
        content: bytes,
        format: str,
        quality: int
    ) -> bytes:
        """Compress using Pillow"""
        
        img = Image.open(io.BytesIO(content))
        
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        
        output_buffer = io.BytesIO()
        fmt = format.upper()
        
        if fmt in ["JPEG", "JPG"]:
            if img.mode == "RGBA":
                img = img.convert("RGB")
            img.save(output_buffer, format="JPEG", quality=quality, optimize=True)
        elif fmt == "PNG":
            img.save(output_buffer, format="PNG", optimize=True)
        elif fmt == "WEBP":
            img.save(output_buffer, format="WEBP", quality=quality)
        else:
            img.save(output_buffer, format=fmt)
        
        return output_buffer.getvalue()
    
    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect image format from filename"""
        
        ext = filename.rsplit(".", 1)[-1].lower()
        
        if ext == "jpg":
            return "jpeg"
        
        return ext

# Global instance
compressor = SmartCompressor()