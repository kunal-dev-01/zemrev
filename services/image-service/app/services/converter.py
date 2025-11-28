# ============================================================================
# FILE: app/services/converter.py
# PURPOSE: Hybrid image converter (PyVips + Pillow)
# COMMIT: feat: add hybrid converter with intelligent engine selection
# ============================================================================

import pyvips
from PIL import Image
import io
import logging
from app.models.schemas import ConvertRequest
from app.services.format_detector import format_detector

logger = logging.getLogger(__name__)

class HybridConverter:
    """Intelligent converter using best engine"""
    
    @staticmethod
    def convert(
        content: bytes,
        filename: str,
        options: ConvertRequest
    ) -> tuple[bytes, str, str]:
        """
        Convert image format
        
        Returns:
            tuple: (output_bytes, new_filename, engine_used)
        """
        
        target_format = options.format.value
        
        if not format_detector.is_supported(target_format):
            raise ValueError(f"Format '{target_format}' not supported")
        
        # Get best engine
        engine = format_detector.get_best_engine(target_format)
        
        try:
            if engine == "pyvips":
                output, new_name = HybridConverter._convert_pyvips(
                    content, filename, options
                )
                return output, new_name, "pyvips"
            
            else:  # pillow
                output, new_name = HybridConverter._convert_pillow(
                    content, filename, options
                )
                return output, new_name, "pillow"
                
        except Exception as e:
            # Try fallback engine
            logger.warning(f"{engine} failed, trying fallback: {e}")
            
            if engine == "pyvips":
                output, new_name = HybridConverter._convert_pillow(
                    content, filename, options
                )
                return output, new_name, "pillow"
            else:
                output, new_name = HybridConverter._convert_pyvips(
                    content, filename, options
                )
                return output, new_name, "pyvips"
    
    @staticmethod
    def _convert_pyvips(
        content: bytes,
        filename: str,
        options: ConvertRequest
    ) -> tuple[bytes, str]:
        """Convert using PyVips"""
        
        img = pyvips.Image.new_from_buffer(content, "", access="sequential")
        
        # Save with format
        fmt = options.format.value
        
        if fmt in ["jpeg", "jpg"]:
            output = img.jpegsave_buffer(
                Q=options.quality,
                strip=True,
                optimize_coding=True
            )
        elif fmt == "png":
            output = img.pngsave_buffer(compression=9, strip=True)
        elif fmt == "webp":
            output = img.webpsave_buffer(Q=options.quality, strip=True)
        elif fmt == "tiff":
            output = img.tiffsave_buffer(Q=options.quality, compression="lzw")
        elif fmt == "avif":
            output = img.heifsave_buffer(
                Q=options.quality,
                compression="av1",
                strip=True
            )
        elif fmt == "ppm":
            output = img.ppmsave_buffer()
        else:
            raise ValueError(f"PyVips: unsupported format {fmt}")
        
        base_name = filename.rsplit(".", 1)[0]
        new_name = f"{base_name}.{fmt}"
        
        return output, new_name
    
    @staticmethod
    def _convert_pillow(
        content: bytes,
        filename: str,
        options: ConvertRequest
    ) -> tuple[bytes, str]:
        """Convert using Pillow"""
        
        img = Image.open(io.BytesIO(content))
        
        # Convert to RGB if necessary
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        
        # Save with format
        fmt = options.format.value.upper()
        output_buffer = io.BytesIO()
        
        save_kwargs = {}
        
        if fmt in ["JPEG", "JPG"]:
            if img.mode == "RGBA":
                img = img.convert("RGB")
            save_kwargs = {"quality": options.quality, "optimize": True}
        elif fmt == "PNG":
            save_kwargs = {"optimize": True}
        elif fmt == "WEBP":
            save_kwargs = {"quality": options.quality}
        elif fmt in ["BMP", "GIF", "ICO", "PPM"]:
            pass
        
        img.save(output_buffer, format=fmt, **save_kwargs)
        
        base_name = filename.rsplit(".", 1)[0]
        new_name = f"{base_name}.{options.format.value}"
        
        return output_buffer.getvalue(), new_name

# Global instance
converter = HybridConverter()