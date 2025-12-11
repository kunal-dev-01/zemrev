"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/sign_pdf.py
PURPOSE: Add signature to PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import Optional
import fitz
from PIL import Image, ImageDraw, ImageFont
import io
from app.core.logging import get_logger

logger = get_logger(__name__)


def sign_pdf(
    input_path: Path,
    output_path: Path,
    signature_text: Optional[str] = None,
    signature_image_path: Optional[Path] = None,
    x: int = 50,
    y: int = 50,
    width: int = 200,
    height: int = 100,
    page_num: int = 0
) -> None:
    """
    Add a signature to a PDF document.
    
    Args:
        input_path: Input PDF file path
        output_path: Output PDF file path
        signature_text: Text signature (e.g., "John Doe")
        signature_image_path: Path to signature image file
        x: X coordinate for signature placement
        y: Y coordinate for signature placement
        width: Width of signature box
        height: Height of signature box
        page_num: Page number to add signature (0-indexed)
    
    Raises:
        Exception: If signing fails
    """
    try:
        doc = fitz.open(input_path)
        
        if page_num >= len(doc):
            doc.close()
            raise ValueError(f"Page {page_num + 1} does not exist. PDF has {len(doc)} pages.")
        
        page = doc[page_num]
        page_rect = page.rect
        
        logger.info(f"Adding signature to page {page_num + 1}/{len(doc)} at ({x},{y})")
        
        # Create signature image
        if signature_image_path:
            # Use provided signature image
            logger.info(f"Using signature image: {signature_image_path}")
            img = Image.open(signature_image_path)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize to fit signature box
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
        else:
            # Create text signature
            logger.info(f"Creating text signature: {signature_text}")
            sig_img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(sig_img)
            
            # Try to load a nice font
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            except:
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
                except:
                    font = ImageFont.load_default()
            
            # Draw text in center
            text = signature_text or "Signature"
            draw.text((10, height // 2 - 12), text, fill=(0, 0, 0, 255), font=font)
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            sig_img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
        
        # Insert signature image into PDF
        sig_rect = fitz.Rect(x, y, x + width, y + height)
        
        # Ensure signature is within page bounds
        if sig_rect.x1 > page_rect.x1 or sig_rect.y1 > page_rect.y1:
            logger.warning(f"Signature box extends beyond page bounds. Adjusting...")
            if sig_rect.x1 > page_rect.x1:
                x = page_rect.x1 - width - 10
            if sig_rect.y1 > page_rect.y1:
                y = page_rect.y1 - height - 10
            sig_rect = fitz.Rect(x, y, x + width, y + height)
        
        page.insert_image(sig_rect, stream=img_bytes.getvalue())
        
        # Save with optimization
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully signed PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to sign PDF: {e}")
        raise Exception(f"PDF signing failed: {str(e)}")