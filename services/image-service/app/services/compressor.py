"""
============================================================================
FILE: app/services/compressor.py
PURPOSE: PyVIPS-only ultra-fast compression
============================================================================
"""

import pyvips
import logging
from app.models.schemas import CompressRequest

logger = logging.getLogger(__name__)

class ImageCompressor:
    """PyVIPS-only image compressor"""
    
    @staticmethod
    def compress(content: bytes, filename: str, options: CompressRequest) -> tuple[bytes, str]:
        """
        Compress image using PyVIPS
        
        Returns:
            tuple: (output_bytes, filename)
        """
        
        try:
            # Load with sequential access
            img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Detect current format
            current_fmt = ImageCompressor._detect_format(filename)
            target_fmt = options.format.value if options.format else current_fmt
            quality = options.quality
            
            # Compress based on format
            if target_fmt in ["jpeg", "jpg"]:
                output = img.jpegsave_buffer(
                    Q=quality,
                    strip=True,
                    optimize_coding=True,
                    interlace=False
                )
            
            elif target_fmt == "png":
                output = img.pngsave_buffer(
                    compression=9,
                    strip=True
                )
            
            elif target_fmt == "webp":
                output = img.webpsave_buffer(
                    Q=quality,
                    lossless=False,
                    effort=4,
                    strip=True
                )
            
            elif target_fmt == "avif":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="av1",
                        speed=6,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=6,
                        strip=True
                    )
            
            elif target_fmt == "tiff":
                output = img.tiffsave_buffer(
                    compression="lzw",
                    strip=True
                )
            
            elif target_fmt == "gif":
                output = img.gifsave_buffer(strip=True)
            
            elif target_fmt == "heic":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="hevc",
                        speed=6,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=6,
                        strip=True
                    )

            elif target_fmt == "heif":
                try:
                    output = img.heifsave_buffer(
                        Q=quality,
                        compression="av1",
                        speed=6,
                        strip=True
                    )
                except Exception:
                    output = img.heifsave_buffer(
                        Q=quality,
                        speed=6,
                        strip=True
                    )
            
            else:
                raise ValueError(f"Unsupported format: {target_fmt}")
            
            compression_ratio = (1 - len(output) / len(content)) * 100
            logger.info(f"Compressed {filename}: {compression_ratio:.1f}% smaller")
            
            return output, filename
            
        except Exception as e:
            logger.error(f"Compression failed: {e}")
            raise ValueError(f"Compression error: {str(e)}")
    
    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect format from filename"""
        ext = filename.rsplit(".", 1)[-1].lower()
        return "jpeg" if ext == "jpg" else ext

compressor = ImageCompressor()
