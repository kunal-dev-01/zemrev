"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/add_watermark.py (UPDATED)
PURPOSE: Add watermark to PDF with font support and coordinate-based positioning
============================================================================
"""

from pathlib import Path
from typing import Tuple, Optional
import fitz
from PIL import Image, ImageDraw, ImageFont
import io
import os

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

# Color mapping (RGB 0-1 scale for PyMuPDF)
_COLOR_MAP = {
    'red': (1, 0, 0), 
    'blue': (0, 0, 1), 
    'green': (0, 1, 0),
    'black': (0, 0, 0), 
    'white': (1, 1, 1), 
    'gray': (0.5, 0.5, 0.5),
    'grey': (0.5, 0.5, 0.5), 
    'yellow': (1, 1, 0),
    'orange': (1, 0.65, 0), 
    'purple': (0.5, 0, 0.5)
}

# Font mapping - same as sign_pdf.py
_FONT_PATHS = {
    'Arial': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'Arial Black': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'Times New Roman': '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
    'Courier New': '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf',
    'Impact': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    'Comic Sans MS': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    'Georgia': '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
    'Verdana': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
}


def _load_font(font_name: str, size: int) -> ImageFont.FreeTypeFont:
    """Load a TrueType font with fallback."""
    # Try requested font
    font_path = _FONT_PATHS.get(font_name)
    
    if font_path and os.path.isfile(font_path):
        try:
            return ImageFont.truetype(font_path, size)
        except:
            pass
    
    # Fallback fonts
    fallback_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    
    for path in fallback_paths:
        if os.path.isfile(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                pass
    
    # Final fallback
    return ImageFont.load_default()


def _text_to_rgba(
    text: str, 
    font: ImageFont.FreeTypeFont,
    rgb: Tuple[int, int, int], 
    opacity: float, 
    rotation: int,
    target_width: int,
    target_height: int
) -> Image.Image:
    """Create rotated text as RGBA image that fits in target dimensions."""
    # Get text dimensions
    dummy = Image.new("RGBA", (1, 1))
    draw = ImageDraw.Draw(dummy)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Create canvas with padding for rotation
    padding = max(text_width, text_height) * 2
    canvas = Image.new("RGBA", (padding, padding), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Draw text with opacity (centered)
    alpha = int(255 * opacity)
    text_x = (padding - text_width) // 2
    text_y = (padding - text_height) // 2
    draw.text(
        (text_x, text_y), 
        text, 
        fill=(*rgb, alpha), 
        font=font
    )
    
    # Rotate and crop to content
    if rotation > 0:
        rotated = canvas.rotate(rotation, expand=True, fillcolor=(0, 0, 0, 0))
        bbox = rotated.getbbox()
        cropped = rotated.crop(bbox) if bbox else rotated
    else:
        bbox = canvas.getbbox()
        cropped = canvas.crop(bbox) if bbox else canvas
    
    # Resize to fit target dimensions (if needed)
    if cropped.width > target_width or cropped.height > target_height:
        cropped.thumbnail((target_width, target_height), Image.LANCZOS)
    
    return cropped


def add_text_watermark(
    pdf_path: Path,
    output_path: Path,
    text: str,
    opacity: float,
    font_size: int,
    rotation: int,
    color: str,
    x: int,
    y: int,
    width: int,
    height: int,
    font: Optional[str] = None,  # NEW parameter
) -> None:
    """
    Add text watermark to PDF with font support.
    
    Args:
        pdf_path: Input PDF path
        output_path: Output PDF path
        text: Watermark text
        opacity: Opacity (0.1-1.0)
        font_size: Font size in points
        rotation: Rotation angle (0-360)
        color: Color name (e.g., 'red', 'blue', 'gray')
        x: X coordinate in PDF points
        y: Y coordinate in PDF points
        width: Width in PDF points
        height: Height in PDF points
        font: Font name (e.g., 'Arial', 'Times New Roman')
    """
    doc = fitz.open(pdf_path)
    
    # Validate page count
    if len(doc) > settings.MAX_PAGES:
        doc.close()
        raise ValueError(f"Too many pages ({len(doc)}) - max {settings.MAX_PAGES}")

    # Get RGB color (convert to 0-255 scale for PIL)
    rgb_normalized = _COLOR_MAP.get(color.lower(), _COLOR_MAP["gray"])
    rgb = tuple(int(c * 255) for c in rgb_normalized)
    
    # Load font with specified name
    font_name = font or 'Arial'
    font_obj = _load_font(font_name, font_size)
    
    logger.info(f"Adding text watermark with font '{font_name}', size {font_size}")

    # Apply watermark to all pages
    for page in doc:
        # Create text image with rotation
        text_img = _text_to_rgba(
            text, 
            font_obj, 
            rgb, 
            opacity, 
            rotation,
            width,
            height
        )
        
        # Calculate target rectangle
        page_rect = page.rect
        target_rect = fitz.Rect(
            page_rect.x0 + x,
            page_rect.y0 + y,
            page_rect.x0 + x + width,
            page_rect.y0 + y + height
        )

        # Insert image as watermark
        buf = io.BytesIO()
        text_img.save(buf, format="PNG")
        page.insert_image(target_rect, stream=buf.getvalue(), overlay=True)

    # Save optimized PDF
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    
    logger.info(f"Text watermark added - {output_path}")


def add_image_watermark(
    pdf_path: Path,
    output_path: Path,
    watermark_image_path: Path,
    opacity: float,
    x: int,
    y: int,
    width: int,
    height: int,
    rotation: int,
) -> None:
    """
    Add image watermark to PDF using coordinate-based positioning.
    
    Args:
        pdf_path: Input PDF path
        output_path: Output PDF path
        watermark_image_path: Watermark image path
        opacity: Opacity (0.1-1.0)
        x: X coordinate in PDF points
        y: Y coordinate in PDF points
        width: Width in PDF points
        height: Height in PDF points
        rotation: Rotation angle (0-360)
    """
    doc = fitz.open(pdf_path)
    
    # Validate page count
    if len(doc) > settings.MAX_PAGES:
        doc.close()
        raise ValueError(f"Too many pages ({len(doc)}) - max {settings.MAX_PAGES}")

    # Load watermark image
    watermark_img = Image.open(watermark_image_path).convert("RGBA")
    
    logger.info(f"Adding image watermark from {watermark_image_path}")
    
    # Apply opacity
    if opacity < 1.0:
        alpha_channel = watermark_img.split()[-1]
        alpha_adjusted = alpha_channel.point(lambda p: int(p * opacity))
        watermark_img.putalpha(alpha_adjusted)
    
    # Apply rotation
    if rotation > 0:
        watermark_img = watermark_img.rotate(
            rotation, 
            expand=True, 
            fillcolor=(0, 0, 0, 0)
        )

    # Apply watermark to all pages
    for page in doc:
        # Resize to target dimensions
        watermark_scaled = watermark_img.resize(
            (width, height), 
            Image.LANCZOS
        )
        
        # Calculate target rectangle
        page_rect = page.rect
        target_rect = fitz.Rect(
            page_rect.x0 + x,
            page_rect.y0 + y,
            page_rect.x0 + x + width,
            page_rect.y0 + y + height
        )

        # Insert image as watermark
        buf = io.BytesIO()
        watermark_scaled.save(buf, format="PNG")
        page.insert_image(target_rect, stream=buf.getvalue(), overlay=True)

    # Save optimized PDF
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    
    logger.info(f"Image watermark added - {output_path}")