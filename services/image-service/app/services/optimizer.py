"""
============================================================================
FILE: app/services/optimizer.py
PURPOSE: PyVIPS-only image optimizer (EXIF strip, orientation fix)
============================================================================
"""

import pyvips
import logging
from app.models.schemas import OptimizeRequest

logger = logging.getLogger(__name__)

class ImageOptimizer:
    """PyVIPS-only image optimizer"""
    
    @staticmethod
    def optimize(content: bytes, filename: str, options: OptimizeRequest) -> tuple[bytes, str]:
        """
        Optimize image (strip metadata, fix orientation)
        """
        
        try:
            # Detect format
            fmt = ImageOptimizer._detect_format(filename)

            # ❌ Block formats that should not be optimized
            UNSUPPORTED = ["heif", "heic", "avif", "tiff", "bmp"]
            if fmt in UNSUPPORTED:
                raise ValueError("This format cannot be optimized. Convert to JPG/PNG/WebP first.")

            # Load optimized (JPEG → shrink=2)
            if fmt in ["jpeg", "jpg"]:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential", shrink=2)
            else:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Fix orientation if requested
            if options.fix_orientation:
                img = ImageOptimizer._fix_orientation(img)
            
            # Save optimized (strip=True removes EXIF/GPS)
            if fmt in ["jpeg", "jpg"]:
                output = img.jpegsave_buffer(
                    Q=85,
                    strip=options.strip_exif,
                    optimize_coding=True,
                    interlace=False
                )
            
            elif fmt == "png":
                output = img.pngsave_buffer(
                    compression=9,
                    strip=options.strip_exif
                )
            
            elif fmt == "webp":
                output = img.webpsave_buffer(
                    Q=85,
                    strip=options.strip_exif
                )
            
            else:
                # fallback — should rarely happen
                output = img.write_to_buffer(f".{fmt}")
            
            # Log optimization result
            compression_ratio = (1 - len(output) / len(content)) * 100
            logger.info(f"Optimized {filename}: {compression_ratio:.1f}% smaller")
            
            return output, filename
            
        except Exception as e:
            logger.error(f"Optimization failed: {e}")
            raise ValueError(f"Optimization error: {str(e)}")
    
    
    @staticmethod
    def _fix_orientation(img: pyvips.Image) -> pyvips.Image:
        """Fix image orientation based on EXIF"""
        try:
            orientation = img.get("orientation")
            
            if orientation == 3:
                img = img.rot180()
            elif orientation == 6:
                img = img.rot90()
            elif orientation == 8:
                img = img.rot270()
            
            # Remove orientation tag
            img = img.copy()
            img.remove("orientation")
            
        except:
            # No EXIF orientation tag
            pass
        
        return img
    
    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect format from filename"""
        ext = filename.rsplit(".", 1)[-1].lower()
        return "jpeg" if ext == "jpg" else ext


optimizer = ImageOptimizer()
