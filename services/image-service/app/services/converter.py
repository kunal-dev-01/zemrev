"""
============================================================================
FILE: app/services/converter.py
PURPOSE: Pure PyVIPS converter (7 formats only)
============================================================================
"""

import pyvips
import logging
from app.models.schemas import ConvertRequest

logger = logging.getLogger(__name__)

class ImageConverter:
    """Pure PyVIPS image converter"""
    
    @staticmethod
    def convert(content: bytes, filename: str, options: ConvertRequest) -> tuple[bytes, str]:
        """Convert image format"""
        
        try:
            ext = filename.rsplit(".", 1)[-1].lower()
            
            # Load (JPEG optimization)
            if ext in ["jpeg", "jpg"]:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential", shrink=2)
            else:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            fmt = options.format.value
            quality = options.quality
            
            # Convert
            if fmt in ["jpeg", "jpg"]:
                output = img.jpegsave_buffer(Q=quality, strip=True, optimize_coding=True)
            
            elif fmt == "png":
                output = img.pngsave_buffer(compression=9, strip=True)
            
            elif fmt == "webp":
                output = img.webpsave_buffer(Q=quality, lossless=False, effort=4, strip=True)
            
            elif fmt == "avif":
                try:
                    output = img.heifsave_buffer(Q=quality, compression="av1", speed=8, strip=True)
                except:
                    output = img.heifsave_buffer(Q=quality, speed=8, strip=True)
            
            elif fmt == "heic":
                try:
                    output = img.heifsave_buffer(Q=quality, compression="hevc", speed=8, strip=True)
                except:
                    output = img.heifsave_buffer(Q=quality, speed=8, strip=True)
            
            elif fmt == "heif":
                try:
                    output = img.heifsave_buffer(Q=quality, compression="av1", speed=8, strip=True)
                except:
                    output = img.heifsave_buffer(Q=quality, speed=8, strip=True)
            
            elif fmt == "tiff":
                output = img.tiffsave_buffer(compression="lzw", strip=True)
            
            else:
                raise ValueError(f"Unsupported format: {fmt}")
            
            base = filename.rsplit(".", 1)[0]
            new_filename = f"{base}.{fmt}"
            
            logger.info(f"Converted {filename} → {fmt} ({len(output)} bytes)")
            return output, new_filename
        
        except Exception as e:
            logger.error(f"Conversion failed: {e}")
            raise ValueError(f"Conversion error: {str(e)}")

converter = ImageConverter()