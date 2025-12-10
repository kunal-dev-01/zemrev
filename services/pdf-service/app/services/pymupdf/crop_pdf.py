# ============================================================================
# 2. CROP PDF (services/pymupdf/crop_pdf.py)
# ============================================================================

from pathlib import Path
import fitz
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

def crop_pdf(
    input_path: Path,
    output_path: Path,
    x: int,
    y: int,
    width: int,
    height: int
) -> None:
    try:
        doc = fitz.open(input_path)
        total_pages = len(doc)
        
        logger.info(f"Cropping PDF: {total_pages} pages to region ({x},{y},{width},{height})")
        
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Create output document
        output_doc = fitz.open()
        
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Define crop rectangle
            crop_rect = fitz.Rect(x, y, x + width, y + height)
            
            # Set the page's cropbox
            page.set_cropbox(crop_rect)
            
            # Add cropped page to output
            output_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
        
        doc.close()
        
        output_doc.save(output_path, garbage=4, deflate=True)
        output_doc.close()
        
        logger.info(f"Successfully cropped PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to crop PDF: {e}")
        raise Exception(f"PDF cropping failed: {str(e)}")