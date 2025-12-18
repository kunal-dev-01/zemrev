"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/sign_pdf.py (FINAL CLEAN)
PURPOSE: Add multiple signatures with MAXIMUM QUALITY
============================================================================
"""

from pathlib import Path
from typing import List, Dict, Any
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont, ImageColor
import io
from app.core.logging import get_logger
import cairosvg

logger = get_logger(__name__)

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex string to RGB tuple"""
    try:
        if hex_color.startswith('#'):
            return ImageColor.getrgb(hex_color)
        return (0, 0, 0)
    except:
        return (0, 0, 0)

def sign_pdf(
    input_path: Path,
    output_path: Path,
    signatures: List[Dict[str, Any]]
) -> None:
    """
    Add multiple signatures to PDF with maximum quality.
    Supports TEXT, PNG, and SVG signatures.
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
                    f"Signature on page {page_num + 1} failed: PDF has only {len(doc)} pages"
                )
        
        # Group signatures by page
        signatures_by_page: Dict[int, List[Dict[str, Any]]] = {}
        for sig in signatures:
            page_num = sig.get('page', 0)
            if page_num not in signatures_by_page:
                signatures_by_page[page_num] = []
            signatures_by_page[page_num].append(sig)
        
        # Process each page
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
                color_hex = sig.get('color', '#000000')
                opacity = float(sig.get('opacity', 1.0))
                rgb_color = hex_to_rgb(color_hex)
                
                # =========================================================
                # IMAGE SIGNATURE (PNG/SVG)
                # =========================================================
                if sig_type == 'image' and 'image_path' in sig:
                    image_path = sig['image_path']
                    logger.info(f"Processing image: {image_path}")
                    
                    try:
                        # SVG - Convert at HIGH resolution
                        if str(image_path).lower().endswith('.svg'):
                            logger.info("Converting SVG at high resolution...")
                            
                            # Render SVG at 4x resolution for crisp output
                            scale = 4
                            png_bytes = cairosvg.svg2png(
                                url=str(image_path),
                                output_width=width * scale,
                                output_height=height * scale
                            )
                            img = Image.open(io.BytesIO(png_bytes))
                            
                            # Downscale with best quality
                            img = img.resize((width, height), Image.Resampling.LANCZOS)
                        
                        # PNG/JPEG
                        else:
                            img = Image.open(image_path)
                            logger.info(f"Original size: {img.width}x{img.height}")
                            
                            # No upscaling - keep original if smaller
                            if img.width <= width and img.height <= height:
                                logger.info("Using original size (no upscaling)")
                                width = img.width
                                height = img.height
                            else:
                                # Preserve aspect ratio
                                aspect = img.width / img.height
                                target_aspect = width / height
                                
                                if aspect > target_aspect:
                                    new_width = width
                                    new_height = int(width / aspect)
                                else:
                                    new_height = height
                                    new_width = int(height * aspect)
                                
                                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                                width = new_width
                                height = new_height
                        
                        # Ensure RGBA
                        if img.mode != 'RGBA':
                            img = img.convert('RGBA')
                        
                        # Apply opacity
                        if opacity < 1.0:
                            alpha = img.split()[3]
                            alpha = alpha.point(lambda p: int(p * opacity))
                            img.putalpha(alpha)
                        
                        # Save PNG with NO compression
                        img_bytes_io = io.BytesIO()
                        img.save(
                            img_bytes_io, 
                            format='PNG',
                            compress_level=0,
                            optimize=False
                        )
                        img_bytes_io.seek(0)
                        png_data = img_bytes_io.getvalue()
                        
                    except Exception as img_err:
                        logger.error(f"Error processing image: {img_err}")
                        continue

                # =========================================================
                # TEXT SIGNATURE
                # =========================================================
                else:
                    text = sig.get('text', 'Signature')
                    font_name = sig.get('font', 'Dancing Script')
                    logger.info(f"Creating text signature: '{text}'")
                    
                    # Render at 2x resolution
                    scale = 2
                    canvas_width = int(width * scale)
                    canvas_height = int(height * scale)
                    
                    sig_img = Image.new('RGBA', (canvas_width, canvas_height), (255, 255, 255, 0))
                    draw = ImageDraw.Draw(sig_img)
                    
                    # Font mapping
                    font_paths = {
                        'Dancing Script': 'app/fonts/DancingScript-Bold.ttf',
                        'Great Vibes': 'app/fonts/GreatVibes-Regular.ttf',
                        'Sacramento': 'app/fonts/Sacramento-Regular.ttf',
                        'Allura': 'app/fonts/Allura-Regular.ttf',
                        'Homemade Apple': 'app/fonts/HomemadeApple-Regular.ttf',
                        'Arial': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
                        'Times New Roman': '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
                    }
                    
                    font_path = font_paths.get(font_name, font_paths['Dancing Script'])
                    target_font_size = min(int(canvas_height * 0.7), 160)
                    
                    try:
                        if font_path and Path(font_path).exists():
                            font = ImageFont.truetype(font_path, target_font_size)
                        else:
                            font = ImageFont.load_default()
                    except Exception as font_err:
                        logger.error(f"Font error: {font_err}")
                        font = ImageFont.load_default()
                    
                    text_fill = (rgb_color[0], rgb_color[1], rgb_color[2], int(255 * opacity))
                    
                    # Center text
                    try:
                        bbox = draw.textbbox((0, 0), text, font=font)
                        text_width = bbox[2] - bbox[0]
                        text_height = bbox[3] - bbox[1]
                    except:
                        text_width, text_height = draw.textsize(text, font=font)
                    
                    text_x = (canvas_width - text_width) // 2
                    text_y = (canvas_height - text_height) // 2
                    
                    draw.text((text_x, text_y), text, fill=text_fill, font=font)
                    
                    # Downscale to target size
                    sig_img = sig_img.resize((width, height), Image.Resampling.LANCZOS)
                    
                    # Save PNG with NO compression
                    img_bytes_io = io.BytesIO()
                    sig_img.save(
                        img_bytes_io,
                        format='PNG',
                        compress_level=0,
                        optimize=False
                    )
                    img_bytes_io.seek(0)
                    png_data = img_bytes_io.getvalue()
                
                # =========================================================
                # INSERT INTO PDF
                # =========================================================
                sig_rect = fitz.Rect(x, y, x + width, y + height)
                
                # Bounds check
                if sig_rect.x1 > page_rect.x1 or sig_rect.y1 > page_rect.y1:
                    logger.warning("Adjusting signature position (out of bounds)")
                    new_x = min(x, page_rect.x1 - width - 5)
                    new_y = min(y, page_rect.y1 - height - 5)
                    sig_rect = fitz.Rect(new_x, new_y, new_x + width, new_y + height)
                
                # Insert with maximum quality
                page.insert_image(
                    sig_rect,
                    stream=png_data,
                    keep_proportion=False,
                    overlay=True,
                    oc=0
                )
        
        # Save PDF
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
            pretty=True
        )
        doc.close()
        
        logger.info(f"Successfully signed PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to sign PDF: {e}")
        if 'doc' in locals():
            doc.close()
        raise Exception(f"PDF signing failed: {str(e)}")