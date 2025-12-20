"""
============================================================================
FILE: app/services/pymupdf/extract_text.py
PURPOSE: Extract text from PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import Optional, Tuple
import fitz  # PyMuPDF

from app.core.logging import get_logger
from app.core.config import settings
from app.services.pymupdf.pdf_to_images import parse_page_range

logger = get_logger(__name__)


def extract_text_from_pdf(
    pdf_path: Path,
    page_range: Optional[str] = None,
    preserve_layout: bool = False
) -> Tuple[str, int]:
    """
    Extract text from PDF.
    
    Args:
        pdf_path: Input PDF file path
        page_range: Optional page range like "1-3,5"
        preserve_layout: Whether to preserve text layout
        
    Returns:
        Tuple of (extracted_text, page_count)
    """
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        logger.info(f"Extracting text from PDF: {total_pages} pages")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Parse page range
        pages_to_extract = parse_page_range(page_range, total_pages)
        logger.info(f"Extracting text from {len(pages_to_extract)} pages")
        
        # Extract text from each page
        extracted_text = []
        
        for page_num in pages_to_extract:
            page = doc[page_num]
            
            if preserve_layout:
                # Preserve layout using "blocks" extraction
                text = page.get_text("text", sort=True)
            else:
                # Simple text extraction
                text = page.get_text()
            
            if text.strip():
                extracted_text.append(f"--- Page {page_num + 1} ---\n{text}\n")
        
        doc.close()
        
        # Combine all text
        full_text = "\n".join(extracted_text)
        
        logger.info(
            f"Successfully extracted {len(full_text)} characters "
            f"from {len(pages_to_extract)} pages"
        )
        
        return full_text, len(pages_to_extract)
        
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise Exception(f"Text extraction failed: {str(e)}")