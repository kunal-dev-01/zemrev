"""
============================================================================
FILE: app/services/converter.py
PURPOSE: PyVIPS-only image converter with HEIC + HEIF support
============================================================================
"""

import pyvips
import logging
from app.models.schemas import ConvertRequest

logger = logging.getLogger(__name__)

class ImageConverter:
    """PyVIPS-only image converter"""
    
    @staticmethod
    def convert(content: bytes, filename: str, options: ConvertRequest) -> tuple[bytes, str]:
        """
        Convert image format using PyVIPS
        
        Returns:
            tuple: (output_bytes, new_filename)
        """
        
        try:
            # Load image with sequential access (memory efficient)
            img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Get target format
            fmt = options.format.value
            quality = options.quality
            
            # Convert based on format
            if fmt in ["jpeg", "jpg"]:
                output = img.jpegsave_buffer(
                    Q=quality,
                    strip=True,
                    optimize_coding=True,
                    interlace=False
                )
            
            elif fmt == "png":
                output = img.pngsave_buffer(
                    compression=9,
                    strip=True
                )
            
            elif fmt == "webp":
                output = img.webpsave_buffer(
                    Q=quality,
                    lossless=False,
                    effort=4,
                    strip=True
                )
            
            elif fmt == "avif":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="av1",
                        speed=8,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=8,
                        strip=True
                    )
            
            elif fmt == "tiff":
                output = img.tiffsave_buffer(
                    compression="lzw",
                    strip=True
                )
            
            elif fmt == "gif":
                output = img.gifsave_buffer(strip=True)
            
            elif fmt == "bmp":
                output = img.magicksave_buffer(format="BMP")
            
            elif fmt == "heic":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="hevc",
                        speed=8,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=8,
                        strip=True
                    )

            elif fmt == "heif":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="av1",
                        speed=8,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=8,
                        strip=True
                    )

            else:
                raise ValueError(f"Unsupported format: {fmt}")
            
            # Generate new filename
            base_name = filename.rsplit(".", 1)[0]
            new_filename = f"{base_name}.{fmt}"
            
            logger.info(f"Converted {filename} to {fmt} ({len(output)} bytes)")
            
            return output, new_filename
            
        except Exception as e:
            logger.error(f"Conversion failed: {e}")
            raise ValueError(f"Conversion error: {str(e)}")

converter = ImageConverter()
