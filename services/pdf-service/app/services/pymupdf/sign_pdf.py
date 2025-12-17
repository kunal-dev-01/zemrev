"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/sign_pdf.py (FULL CODE)
PURPOSE: Add multiple signatures to PDF using PyMuPDF with Color & Opacity
============================================================================
"""

from pathlib import Path
from typing import Optional, List, Dict, Any
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont, ImageColor
import io
from app.core.logging import get_logger

logger = get_logger(__name__)

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex string to RGB tuple"""
    try:
        if hex_color.startswith('#'):
            return ImageColor.getrgb(hex_color)
        return (0, 0, 0) # Default Black
    except:
        return (0, 0, 0)

def sign_pdf(
    input_path: Path,
    output_path: Path,
    signatures: List[Dict[str, Any]]
) -> None:
    """
    Add multiple signatures to a PDF document.
    """
    try:
        doc = fitz.open(input_path)
        
        logger.info(f"Processing {len(signatures)} signatures for PDF with {len(doc)} pages")
        
        # 1. Validate all pages exist
        for sig in signatures:
            page_num = sig.get('page', 0)
            if page_num >= len(doc):
                doc.close()
                raise ValueError(
                    f"Signature on page {page_num + 1} failed: "
                    f"PDF has only {len(doc)} pages"
                )
        
        # 2. Group signatures by page for efficiency
        signatures_by_page: Dict[int, List[Dict[str, Any]]] = {}
        for sig in signatures:
            page_num = sig.get('page', 0)
            if page_num not in signatures_by_page:
                signatures_by_page[page_num] = []
            signatures_by_page[page_num].append(sig)
        
        # 3. Process each page
        for page_num, page_signatures in signatures_by_page.items():
            page = doc[page_num]
            page_rect = page.rect
            
            logger.info(f"Adding {len(page_signatures)} signatures to page {page_num + 1}")
            
            for sig in page_signatures:
                # Extract Basic Properties
                x = sig.get('x', 50)
                y = sig.get('y', 50)
                width = sig.get('width', 200)
                height = sig.get('height', 80)
                sig_type = sig.get('type', 'text')
                
                # Extract New Properties (Color & Opacity)
                color_hex = sig.get('color', '#000000')
                opacity = float(sig.get('opacity', 1.0))
                
                # Convert Hex to RGB
                rgb_color = hex_to_rgb(color_hex)
                
                # Prepare Image Buffer
                img_bytes_io = io.BytesIO()
                
                # =========================================================
                # LOGIC: IMAGE SIGNATURE
                # =========================================================
                if sig_type == 'image' and 'image_path' in sig:
                    image_path = sig['image_path']
                    logger.info(f"Processing image signature: {image_path}")
                    
                    try:
                        img = Image.open(image_path)
                        if img.mode != 'RGBA':
                            img = img.convert('RGBA')
                        
                        # High Quality Resize
                        img = img.resize((width, height), Image.Resampling.LANCZOS)
                        
                        # Apply Opacity to Image
                        if opacity < 1.0:
                            # Get the alpha channel
                            alpha = img.split()[3]
                            # Reduce alpha values by the opacity factor
                            alpha = alpha.point(lambda p: int(p * opacity))
                            # Put new alpha channel back
                            img.putalpha(alpha)
                        
                        img.save(img_bytes_io, format='PNG')
                        
                    except Exception as img_err:
                        logger.error(f"Error processing image signature: {img_err}")
                        continue # Skip this signature if image fails

                # =========================================================
                # LOGIC: TEXT SIGNATURE
                # =========================================================
                else:
                    text = sig.get('text', 'Signature')
                    font_name = sig.get('font', 'Dancing Script')
                    
                    logger.info(f"Creating text signature: '{text}' Font: {font_name} Color: {color_hex} Opacity: {opacity}")
                    
                    # Create transparent canvas
                    sig_img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
                    draw = ImageDraw.Draw(sig_img)
                    
                    # FONT MAPPING (Ensure these files exist in app/fonts/)
                    # You can map multiple names to the same file if needed
                    font_paths = {
                        'Dancing Script': 'app/fonts/DancingScript-Bold.ttf',
                        'Great Vibes': 'app/fonts/GreatVibes-Regular.ttf',
                        'Sacramento': 'app/fonts/Sacramento-Regular.ttf',
                        'Allura': 'app/fonts/Allura-Regular.ttf',
                        'Homemade Apple': 'app/fonts/HomemadeApple-Regular.ttf',
                        # Fallbacks
                        'Arial': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 
                        'Times New Roman': '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
                    }
                    
                    # Get Font Path
                    font_path = font_paths.get(font_name, font_paths.get('Dancing Script'))
                    
                    # Calculate Font Size (Dynamic based on height)
                    # Start with roughly 60% of height, maxing out at 60px
                    target_font_size = min(int(height * 0.7), 80)
                    
                    try:
                        if font_path and Path(font_path).exists():
                            font = ImageFont.truetype(font_path, target_font_size)
                        else:
                            # Try system font or default if custom font missing
                            logger.warning(f"Font file not found: {font_path}, utilizing default.")
                            font = ImageFont.load_default()
                    except Exception as font_err:
                        logger.error(f"Font loading error: {font_err}")
                        font = ImageFont.load_default()
                    
                    # Prepare Color Tuple with Opacity (R, G, B, A)
                    # Alpha = 255 * opacity (e.g., 1.0 = 255, 0.5 = 127)
                    text_fill = (rgb_color[0], rgb_color[1], rgb_color[2], int(255 * opacity))
                    
                    # Center Text Logic
                    try:
                        bbox = draw.textbbox((0, 0), text, font=font)
                        text_width = bbox[2] - bbox[0]
                        text_height = bbox[3] - bbox[1]
                    except:
                        # Fallback for older PIL versions
                        text_width, text_height = draw.textsize(text, font=font)
                    
                    text_x = (width - text_width) // 2
                    text_y = (height - text_height) // 2
                    
                    # Draw Text
                    draw.text(
                        (text_x, text_y), 
                        text, 
                        fill=text_fill, 
                        font=font
                    )
                    
                    sig_img.save(img_bytes_io, format='PNG')
                
                # =========================================================
                # INSERTION INTO PDF
                # =========================================================
                img_bytes_io.seek(0)
                
                # Initial Rect
                sig_rect = fitz.Rect(x, y, x + width, y + height)
                
                # Bounds Check: Ensure signature stays inside the page
                if sig_rect.x1 > page_rect.x1 or sig_rect.y1 > page_rect.y1:
                    logger.warning(f"Signature out of bounds. Adjusting...")
                    new_x = x
                    new_y = y
                    
                    if sig_rect.x1 > page_rect.x1:
                        new_x = page_rect.x1 - width - 5
                    if sig_rect.y1 > page_rect.y1:
                        new_y = page_rect.y1 - height - 5
                        
                    sig_rect = fitz.Rect(new_x, new_y, new_x + width, new_y + height)
                
                # Insert the PNG buffer into PDF
                page.insert_image(sig_rect, stream=img_bytes_io.getvalue())
        
        # 4. Save
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully signed PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to sign PDF: {e}")
        if 'doc' in locals():
            doc.close()
        raise Exception(f"PDF signing failed: {str(e)}")