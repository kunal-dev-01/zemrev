"""
============================================================================
FILE: app/services/cropper.py
PURPOSE: PyVIPS-only image cropper
============================================================================
"""

import pyvips
import logging
from app.models.schemas import CropRequest

logger = logging.getLogger(__name__)

class ImageCropper:
    """PyVIPS-only image cropper"""
    
    @staticmethod
    def crop(content: bytes, filename: str, options: CropRequest) -> tuple[bytes, str]:
        """
        Crop image using PyVIPS
        """
        
        try:
            # Detect source format
            ext = filename.rsplit(".", 1)[-1].lower()

            # ❌ Block non-editable formats
            UNSUPPORTED_EDIT = ["heif", "heic", "avif", "tiff", "bmp"]
            if ext in UNSUPPORTED_EDIT:
                raise ValueError("This format cannot be cropped. Convert to JPG/PNG/WebP first.")

            # Load image (JPEG → shrink=2 optimization)
            if ext in ["jpeg", "jpg"]:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential", shrink=2)
            else:
                img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Validate crop bounds
            if options.x + options.width > img.width:
                raise ValueError(f"Crop exceeds image width ({img.width}px)")
            
            if options.y + options.height > img.height:
                raise ValueError(f"Crop exceeds image height ({img.height}px)")
            
            # Perform crop
            cropped = img.crop(options.x, options.y, options.width, options.height)
            
            # Determine output format
            target_fmt = options.format.value if options.format else ImageCropper._detect_format(filename)
            
            # Save based on format
            if target_fmt in ["jpeg", "jpg"]:
                output = cropped.jpegsave_buffer(
                    Q=85,
                    strip=True,
                    optimize_coding=True
                )

            elif target_fmt == "png":
                output = cropped.pngsave_buffer(
                    compression=9,
                    strip=True
                )

            elif target_fmt == "webp":
                output = cropped.webpsave_buffer(
                    Q=85,
                    strip=True
                )

            elif target_fmt == "gif":
                output = cropped.gifsave_buffer(strip=True)

            elif target_fmt == "avif":
                # Optional — but we allow because user forced format
                output = cropped.heifsave_buffer(
                    Q=50,
                    compression="av1",
                    strip=True
                )

            else:
                # Generic fallback
                output = cropped.write_to_buffer(f".{target_fmt}")
            
            logger.info(f"Cropped {filename} to {options.width}x{options.height}")
            
            return output, filename
        
        except Exception as e:
            logger.error(f"Crop failed: {e}")
            raise ValueError(f"Crop error: {str(e)}")
    

    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect format from filename"""
        ext = filename.rsplit(".", 1)[-1].lower()
        return "jpeg" if ext == "jpg" else ext


cropper = ImageCropper()
