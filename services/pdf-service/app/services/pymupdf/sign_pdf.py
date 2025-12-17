"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/sign_pdf.py (UPDATED)
PURPOSE: Add multiple signatures to PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import Optional, List, Dict, Any
import fitz
from PIL import Image, ImageDraw, ImageFont
import io
from app.core.logging import get_logger

logger = get_logger(__name__)


def sign_pdf(
    input_path: Path,
    output_path: Path,
    signatures: List[Dict[str, Any]]
) -> None:
    """
    Add multiple signatures to a PDF document.
    
    Args:
        input_path: Input PDF file path
        output_path: Output PDF file path
        signatures: List of signature dictionaries with:
            - id: Signature ID
            - type: 'text' or 'image'
            - text: Text for text signatures
            - font: Font name for text signatures
            - image_path: Path to image for image signatures
            - x, y, width, height: Position and size
            - page: Page number (0-indexed)
    
    Raises:
        Exception: If signing fails
    """
    try:
        doc = fitz.open(input_path)
        
        logger.info(f"Processing {len(signatures)} signatures for PDF with {len(doc)} pages")
        
        # Validate all pages exist
        for sig in signatures:
            page_num = sig.get('page', 0)
            if page_num >= len(doc):
                doc.close()
                raise ValueError(
                    f"Signature on page {page_num + 1} failed: "
                    f"PDF has only {len(doc)} pages"
                )
        
        # Group signatures by page for efficiency
        signatures_by_page: Dict[int, List[Dict[str, Any]]] = {}
        for sig in signatures:
            page_num = sig.get('page', 0)
            if page_num not in signatures_by_page:
                signatures_by_page[page_num] = []
            signatures_by_page[page_num].append(sig)
        
        # Process each page with signatures
        for page_num, page_signatures in signatures_by_page.items():
            page = doc[page_num]
            page_rect = page.rect
            
            logger.info(f"Adding {len(page_signatures)} signatures to page {page_num + 1}")
            
            for sig in page_signatures:
                x = sig.get('x', 50)
                y = sig.get('y', 50)
                width = sig.get('width', 200)
                height = sig.get('height', 80)
                sig_type = sig.get('type', 'text')
                
                # Create signature image
                if sig_type == 'image' and 'image_path' in sig:
                    # Use provided signature image
                    image_path = sig['image_path']
                    logger.info(f"Using signature image: {image_path}")
                    
                    img = Image.open(image_path)
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
                    text = sig.get('text', 'Signature')
                    font_name = sig.get('font', 'Arial')
                    
                    logger.info(f"Creating text signature: '{text}' with font '{font_name}'")
                    
                    sig_img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
                    draw = ImageDraw.Draw(sig_img)
                    
                    # Font mapping
                    font_paths = {
                        'Arial': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
                        'Times New Roman': '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
                        'Courier New': '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf',
                        'Georgia': '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
                        'Verdana': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                        'Helvetica': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
                        'Brush Script MT': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                        'Lucida Handwriting': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                    }
                    
                    # Try to load requested font
                    font_path = font_paths.get(font_name)
                    font_size = min(32, height // 2)
                    
                    try:
                        if font_path and Path(font_path).exists():
                            font = ImageFont.truetype(font_path, font_size)
                        else:
                            # Fallback to DejaVu
                            font = ImageFont.truetype(
                                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 
                                font_size
                            )
                    except:
                        try:
                            # macOS fallback
                            font = ImageFont.truetype(
                                "/System/Library/Fonts/Helvetica.ttc", 
                                font_size
                            )
                        except:
                            font = ImageFont.load_default()
                    
                    # Calculate text position (center)
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    
                    text_x = (width - text_width) // 2
                    text_y = (height - text_height) // 2
                    
                    # Draw text with italic style simulation
                    draw.text(
                        (text_x, text_y), 
                        text, 
                        fill=(0, 0, 0, 255), 
                        font=font
                    )
                    
                    # Convert to bytes
                    img_bytes = io.BytesIO()
                    sig_img.save(img_bytes, format='PNG')
                    img_bytes.seek(0)
                
                # Insert signature image into PDF
                sig_rect = fitz.Rect(x, y, x + width, y + height)
                
                # Ensure signature is within page bounds
                if sig_rect.x1 > page_rect.x1 or sig_rect.y1 > page_rect.y1:
                    logger.warning(
                        f"Signature box extends beyond page bounds. Adjusting..."
                    )
                    if sig_rect.x1 > page_rect.x1:
                        x = page_rect.x1 - width - 10
                    if sig_rect.y1 > page_rect.y1:
                        y = page_rect.y1 - height - 10
                    sig_rect = fitz.Rect(x, y, x + width, y + height)
                
                page.insert_image(sig_rect, stream=img_bytes.getvalue())
        
        # Save with optimization
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully signed PDF with {len(signatures)} signatures -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to sign PDF: {e}")
        raise Exception(f"PDF signing failed: {str(e)}")