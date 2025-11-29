"""
============================================================================
FILE: app/services/watermark.py
PURPOSE: PyVIPS-only watermark tool (text + image)
============================================================================
"""

import pyvips
import logging
from app.models.schemas import TextWatermarkRequest, ImageWatermarkRequest, WatermarkPosition

logger = logging.getLogger(__name__)

class Watermarker:
    """PyVIPS-only watermark tool"""
    
    @staticmethod
    def add_text_watermark(content: bytes, filename: str, options: TextWatermarkRequest) -> tuple[bytes, str]:
        """
        Add text watermark using PyVIPS
        
        Returns:
            tuple: (output_bytes, filename)
        """
        
        try:
            # Load image
            img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Create text layer
            text = pyvips.Image.text(
                options.text,
                font=f"sans {options.font_size}",
                fontfile=None,
                dpi=96
            )
            
            # Convert color hex to RGB
            color_rgb = Watermarker._hex_to_rgb(options.color)
            
            # Create colored text
            text = text.colourspace("srgb")
            text = (text * [color_rgb[0] / 255, color_rgb[1] / 255, color_rgb[2] / 255]).cast("uchar")
            
            # Add alpha channel with opacity
            alpha = (text[0] * options.opacity).cast("uchar")
            text = text.bandjoin(alpha)
            
            # Calculate position
            x, y = Watermarker._calculate_position(
                img.width, img.height,
                text.width, text.height,
                options.position
            )
            
            # Composite (blend) watermark
            if img.bands < 4:
                img = img.bandjoin(255)  # Add alpha channel
            
            result = img.composite(text, "over", x=x, y=y)
            
            # Save
            fmt = Watermarker._detect_format(filename)
            output = Watermarker._save_image(result, fmt)
            
            logger.info(f"Added text watermark to {filename}")
            
            return output, filename
            
        except Exception as e:
            logger.error(f"Text watermark failed: {e}")
            raise ValueError(f"Watermark error: {str(e)}")
    
    @staticmethod
    def add_image_watermark(content: bytes, watermark_content: bytes, filename: str, options: ImageWatermarkRequest) -> tuple[bytes, str]:
        """
        Add image watermark using PyVIPS
        
        Returns:
            tuple: (output_bytes, filename)
        """
        
        try:
            # Load base image
            img = pyvips.Image.new_from_buffer(content, "", access="sequential")
            
            # Load watermark image
            logo = pyvips.Image.new_from_buffer(watermark_content, "", access="sequential")
            
            # Scale watermark
            target_width = int(img.width * options.scale)
            logo = logo.thumbnail_image(target_width, height=9999)
            
            # Apply opacity
            if logo.bands < 4:
                logo = logo.bandjoin(255)
            
            logo = logo.copy()
            logo[-1] = (logo[-1] * options.opacity).cast("uchar")
            
            # Calculate position
            x, y = Watermarker._calculate_position(
                img.width, img.height,
                logo.width, logo.height,
                options.position
            )
            
            # Composite
            if img.bands < 4:
                img = img.bandjoin(255)
            
            result = img.composite(logo, "over", x=x, y=y)
            
            # Save
            fmt = Watermarker._detect_format(filename)
            output = Watermarker._save_image(result, fmt)
            
            logger.info(f"Added image watermark to {filename}")
            
            return output, filename
            
        except Exception as e:
            logger.error(f"Image watermark failed: {e}")
            raise ValueError(f"Watermark error: {str(e)}")
    
    @staticmethod
    def _calculate_position(img_w: int, img_h: int, wm_w: int, wm_h: int, position: WatermarkPosition) -> tuple[int, int]:
        """Calculate watermark position"""
        
        padding = 20
        
        if position == WatermarkPosition.TOP_LEFT:
            return padding, padding
        elif position == WatermarkPosition.TOP_RIGHT:
            return img_w - wm_w - padding, padding
        elif position == WatermarkPosition.BOTTOM_LEFT:
            return padding, img_h - wm_h - padding
        elif position == WatermarkPosition.BOTTOM_RIGHT:
            return img_w - wm_w - padding, img_h - wm_h - padding
        elif position == WatermarkPosition.CENTER:
            return (img_w - wm_w) // 2, (img_h - wm_h) // 2
        else:
            return padding, img_h - wm_h - padding
    
    @staticmethod
    def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
        """Convert hex color to RGB"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    @staticmethod
    def _detect_format(filename: str) -> str:
        """Detect format from filename"""
        ext = filename.rsplit(".", 1)[-1].lower()
        return "jpeg" if ext == "jpg" else ext
    
    @staticmethod
    def _save_image(img: pyvips.Image, fmt: str) -> bytes:
        """Save image in format"""
        if fmt in ["jpeg", "jpg"]:
            return img.jpegsave_buffer(Q=85, strip=True)
        elif fmt == "png":
            return img.pngsave_buffer(compression=9, strip=True)
        elif fmt == "webp":
            return img.webpsave_buffer(Q=85, strip=True)
        else:
            return img.write_to_buffer(f".{fmt}")

watermarker = Watermarker()