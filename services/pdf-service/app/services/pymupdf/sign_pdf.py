# ============================================================================
# 1. SIGN PDF (services/pymupdf/sign_pdf.py)
# ============================================================================

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
    try:
        doc = fitz.open(input_path)
        
        if page_num >= len(doc):
            raise ValueError(f"Page {page_num + 1} does not exist")
        
        page = doc[page_num]
        page_rect = page.rect
        
        # Create signature box
        if signature_image_path:
            # Use provided signature image
            img = Image.open(signature_image_path)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
        else:
            # Create text signature
            sig_img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(sig_img)
            
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            draw.text((10, height // 2 - 12), signature_text or "Signature", fill=(0, 0, 0, 255), font=font)
            
            img_bytes = io.BytesIO()
            sig_img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
        
        # Insert signature
        sig_rect = fitz.Rect(x, y, x + width, y + height)
        page.insert_image(sig_rect, stream=img_bytes.getvalue())
        
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        logger.info(f"Successfully signed PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to sign PDF: {e}")
        raise Exception(f"PDF signing failed: {str(e)}")