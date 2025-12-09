"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/add_watermark.py
PURPOSE: Add watermark to PDF using PyMuPDF (FIXED VERSION)
============================================================================
"""

from pathlib import Path
from typing import Optional, Tuple
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
import io

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


# Color mapping (RGB normalized to 0-1 for PyMuPDF)
COLOR_MAP = {
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


def get_position_coords(
    position: str, 
    page_width: float, 
    page_height: float, 
    watermark_width: float, 
    watermark_height: float
) -> Tuple[float, float]:
    """
    Calculate watermark position coordinates (bottom-left corner).
    
    Returns:
        Tuple of (x, y) coordinates for bottom-left corner
    """
    margin = 50  # Margin from edges
    
    if position == "center":
        x = (page_width - watermark_width) / 2
        y = (page_height - watermark_height) / 2
    elif position == "top_left":
        x = margin
        y = page_height - watermark_height - margin
    elif position == "top_right":
        x = page_width - watermark_width - margin
        y = page_height - watermark_height - margin
    elif position == "bottom_left":
        x = margin
        y = margin + watermark_height
    elif position == "bottom_right":
        x = page_width - watermark_width - margin
        y = margin + watermark_height
    else:
        # Default center
        x = (page_width - watermark_width) / 2
        y = (page_height - watermark_height) / 2
    
    return (x, y)


def add_text_watermark(
    pdf_path: Path,
    output_path: Path,
    text: str,
    opacity: float = 0.3,
    position: str = "center",
    font_size: int = 50,
    rotation: int = 45,
    color: str = "gray"
) -> None:
    """
    Add text watermark to PDF using PIL image overlay method.
    
    Args:
        pdf_path: Input PDF file path
        output_path: Output PDF file path
        text: Watermark text
        opacity: Opacity (0.1-1.0)
        position: Position preset
        font_size: Font size
        rotation: Rotation angle (degrees)
        color: Text color
    """
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        logger.info(f"Adding text watermark '{text}' to {total_pages} pages")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Get RGB color for PIL (0-255)
        rgb_color = tuple(int(c * 255) for c in COLOR_MAP.get(color.lower(), (0.5, 0.5, 0.5)))
        
        # Create watermark for each page
        for page_num in range(total_pages):
            page = doc[page_num]
            page_rect = page.rect
            page_width = int(page_rect.width)
            page_height = int(page_rect.height)
            
            # Create watermark image with PIL
            # Make it larger to accommodate rotation
            canvas_size = max(page_width, page_height) * 2
            watermark = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 0))
            draw = ImageDraw.Draw(watermark)
            
            # Try to load a good font
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", font_size)
                except:
                    # Fallback to default
                    font = ImageFont.load_default()
            
            # Draw text at center of canvas
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            text_x = (canvas_size - text_width) / 2
            text_y = (canvas_size - text_height) / 2
            
            # Draw text with opacity
            text_color = (*rgb_color, int(255 * opacity))
            draw.text((text_x, text_y), text, fill=text_color, font=font)
            
            # Rotate watermark
            if rotation != 0:
                watermark = watermark.rotate(rotation, expand=False)
            
            # Crop to page size centered
            left = (canvas_size - page_width) // 2
            top = (canvas_size - page_height) // 2
            watermark = watermark.crop((left, top, left + page_width, top + page_height))
            
            # Adjust position offset if not center
            if position != "center":
                # Create new canvas
                final_watermark = Image.new('RGBA', (page_width, page_height), (255, 255, 255, 0))
                
                # Calculate paste position
                wm_width, wm_height = watermark.size
                margin = 50
                
                if position == "top_left":
                    paste_x = margin
                    paste_y = margin
                elif position == "top_right":
                    paste_x = page_width - wm_width - margin
                    paste_y = margin
                elif position == "bottom_left":
                    paste_x = margin
                    paste_y = page_height - wm_height - margin
                elif position == "bottom_right":
                    paste_x = page_width - wm_width - margin
                    paste_y = page_height - wm_height - margin
                else:  # center
                    paste_x = (page_width - wm_width) // 2
                    paste_y = (page_height - wm_height) // 2
                
                # Paste watermark at position
                final_watermark.paste(watermark, (paste_x, paste_y), watermark)
                watermark = final_watermark
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            watermark.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Insert watermark as image overlay
            img_rect = fitz.Rect(0, 0, page_width, page_height)
            page.insert_image(img_rect, stream=img_bytes.getvalue(), overlay=True)
            
            logger.debug(f"Added text watermark to page {page_num + 1}")
        
        # Save PDF
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully added text watermark to {total_pages} pages -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to add text watermark: {e}")
        raise Exception(f"Text watermark addition failed: {str(e)}")


def add_image_watermark(
    pdf_path: Path,
    output_path: Path,
    watermark_image_path: Path,
    opacity: float = 0.3,
    position: str = "center",
    scale: float = 0.3
) -> None:
    """
    Add image watermark to PDF.
    
    Args:
        pdf_path: Input PDF file path
        output_path: Output PDF file path
        watermark_image_path: Watermark image file path
        opacity: Opacity (0.1-1.0)
        position: Position preset
        scale: Scale factor for watermark (0.1-1.0)
    """
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        logger.info(f"Adding image watermark to {total_pages} pages")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Load watermark image with PIL
        watermark_img = Image.open(watermark_image_path)
        
        # Convert to RGBA for opacity
        if watermark_img.mode != 'RGBA':
            watermark_img = watermark_img.convert('RGBA')
        
        # Apply opacity
        alpha = watermark_img.split()[3]
        alpha = alpha.point(lambda p: int(p * opacity))
        watermark_img.putalpha(alpha)
        
        # Add watermark to each page
        for page_num in range(total_pages):
            page = doc[page_num]
            page_rect = page.rect
            
            # Calculate watermark size based on page size
            watermark_width = page_rect.width * scale
            watermark_height = (watermark_img.height / watermark_img.width) * watermark_width
            
            # Resize watermark
            resized_watermark = watermark_img.resize(
                (int(watermark_width), int(watermark_height)),
                Image.Resampling.LANCZOS
            )
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            resized_watermark.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Calculate position (now using correct coordinate system)
            # PyMuPDF uses bottom-left origin, not top-left
            margin = 50
            
            if position == "center":
                x0 = (page_rect.width - watermark_width) / 2
                y0 = (page_rect.height - watermark_height) / 2
            elif position == "top_left":
                x0 = margin
                y0 = page_rect.height - watermark_height - margin
            elif position == "top_right":
                x0 = page_rect.width - watermark_width - margin
                y0 = page_rect.height - watermark_height - margin
            elif position == "bottom_left":
                x0 = margin
                y0 = margin
            elif position == "bottom_right":
                x0 = page_rect.width - watermark_width - margin
                y0 = margin
            else:
                # Default center
                x0 = (page_rect.width - watermark_width) / 2
                y0 = (page_rect.height - watermark_height) / 2
            
            # Create rectangle for watermark (x0, y0, x1, y1)
            x1 = x0 + watermark_width
            y1 = y0 + watermark_height
            img_rect = fitz.Rect(x0, y0, x1, y1)
            
            # Insert watermark image
            page.insert_image(img_rect, stream=img_bytes.getvalue(), overlay=True)
            
            logger.debug(
                f"Added image watermark to page {page_num + 1} "
                f"at position {position} ({x0:.0f}, {y0:.0f})"
            )
        
        # Save PDF
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully added image watermark to {total_pages} pages -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to add image watermark: {e}")
        raise Exception(f"Image watermark addition failed: {str(e)}")