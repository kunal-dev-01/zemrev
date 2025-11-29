"""
============================================================================
FILE: app/services/resizer.py
PURPOSE: PyVIPS-only ultra-fast resizer
============================================================================
"""

import pyvips
import logging
from app.models.schemas import ResizeRequest, ResizeMode

logger = logging.getLogger(__name__)

class ImageResizer:
    """PyVIPS-only image resizer"""
    
    @staticmethod
    def resize(content: bytes, filename: str, options: ResizeRequest) -> tuple[bytes, str, tuple[int, int]]:
        """
        Resize image using PyVIPS
        
        Returns:
            tuple: (output_bytes, filename, new_dimensions)
        """
        
        try:
            # Load with sequential access + shrink-on-load for JPEGs
            img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            original_width = img.width
            original_height = img.height
            
            # Calculate target dimensions
            target_width, target_height = ImageResizer._calculate_dimensions(
                original_width, original_height, options
            )
            
            # Resize based on mode
            if options.mode == ResizeMode.CONTAIN:
                # Fit inside, maintain aspect
                resized = img.thumbnail_image(
                    target_width,
                    height=target_height,
                    size=pyvips.Size.DOWN
                )
            
            elif options.mode == ResizeMode.COVER:
                # Fill area, crop excess (smart crop)
                resized = img.thumbnail_image(
                    target_width,
                    height=target_height,
                    size=pyvips.Size.BOTH,
                    crop=pyvips.Interesting.ATTENTION  # Smart crop
                )
            
            elif options.mode == ResizeMode.STRETCH:
                # Force exact dimensions (may distort)
                scale_w = target_width / original_width
                scale_h = target_height / original_height
                resized = img.resize(scale_w, vscale=scale_h)
            
            elif options.mode == ResizeMode.EXACT:
                # Exact dimensions
                scale_w = target_width / original_width
                scale_h = target_height / original_height
                resized = img.resize(scale_w, vscale=scale_h)
            
            else:
                raise ValueError(f"Unknown resize mode: {options.mode}")
            
            # Save in original or target format
            target_fmt = options.format.value if options.format else ImageResizer._detect_format(filename)
            
            if target_fmt in ["jpeg", "jpg"]:
                output = resized.jpegsave_buffer(
                    Q=85,
                    strip=True,
                    optimize_coding=True
                )
            elif target_fmt == "png":
                output = resized.pngsave_buffer(compression=9, strip=True)
            elif target_fmt == "webp":
                output = resized.webpsave_buffer(Q=85, strip=True)
            elif target_fmt == "avif":
                output = resized.heifsave_buffer(Q=50, compression="av1", strip=True)
            else:
                output = resized.write_to_buffer(f".{target_fmt}")
            
            logger.info(f"Resized {filename} to {resized.width}x{resized.height}")
            
            return output, filename, (resized.width, resized.height)
            
        except Exception as e:
            logger.error(f"Resize failed: {e}")
            raise ValueError(f"Resize error: {str(e)}")
    
    @staticmethod
    def _calculate_dimensions(orig_w: int, orig_h: int, options: ResizeRequest) -> tuple[int, int]:
        """Calculate target dimensions"""
        
        if options.width and options.height:
            return options.width, options.height
        
        elif options.width:
            # Maintain aspect ratio
            scale = options.width / orig_w
            return options.width, int(orig_h * scale)
        
        elif options.height:
            # Maintain aspect ratio
            scale = options.height / orig_h
            return int(orig_w * scale), options.height
        
        else:
            raise ValueError("Width or height required")
    
    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect format from filename"""
        ext = filename.rsplit(".", 1)[-1].lower()
        return "jpeg" if ext == "jpg" else ext

resizer = ImageResizer()