"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/add_watermark.py
PURPOSE: Add watermark to PDF using PyMuPDF (Coordinate-based positioning)
============================================================================
"""

from pathlib import Path
from typing import Tuple
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


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    """Load a bold TrueType font or fallback to default."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    
    for path in font_paths:
        if os.path.isfile(path):
            return ImageFont.truetype(path, size)
    
    return ImageFont.load_default()


def _text_to_rgba(
    text: str, 
    font: ImageFont.FreeTypeFont,
    rgb: Tuple[int, int, int], 
    opacity: float, 
    rotation: int
) -> Image.Image:
    """Create rotated text as RGBA image."""
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
    
    # Draw text with opacity
    alpha = int(255 * opacity)
    draw.text(
        (padding // 2, padding // 2), 
        text, 
        fill=(*rgb, alpha), 
        font=font
    )
    
    # Rotate and crop to content
    rotated = canvas.rotate(rotation, expand=True, fillcolor=(0, 0, 0, 0))
    bbox = rotated.getbbox()
    
    return rotated.crop(bbox) if bbox else rotated


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
) -> None:
    """
    Add text watermark to PDF using coordinate-based positioning.
    
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
    """
    doc = fitz.open(pdf_path)
    
    # Validate page count
    if len(doc) > settings.MAX_PAGES:
        doc.close()
        raise ValueError(f"Too many pages ({len(doc)}) - max {settings.MAX_PAGES}")

    # Get RGB color (convert to 0-255 scale for PIL)
    rgb_normalized = _COLOR_MAP.get(color.lower(), _COLOR_MAP["gray"])
    rgb = tuple(int(c * 255) for c in rgb_normalized)
    
    # Load font
    font = _load_font(font_size)

    # Apply watermark to all pages
    for page in doc:
        # Create text image with rotation
        text_img = _text_to_rgba(text, font, rgb, opacity, rotation)
        
        # Calculate target rectangle (page coordinates + user coordinates)
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