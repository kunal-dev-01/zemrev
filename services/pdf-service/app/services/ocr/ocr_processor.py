"""
============================================================================
FILE: app/services/ocr/ocr_processor.py
PURPOSE: OCR processing using Tesseract
============================================================================
"""

from pathlib import Path
from typing import List, Optional, Tuple
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import io
import tempfile

from app.core.logging import get_logger
from app.core.config import settings
from app.services.pymupdf.pdf_to_images import parse_page_range

logger = get_logger(__name__)


def ocr_pdf_to_searchable(
    input_path: Path,
    output_path: Path,
    language: str = "eng",
    dpi: int = 300
) -> int:
    """
    Convert image-based PDF to searchable PDF using OCR.
    
    Args:
        input_path: Input PDF file path
        output_path: Output searchable PDF file path
        language: Tesseract language code (eng, fra, deu, etc.)
        dpi: DPI for OCR processing (150-600)
        
    Returns:
        Number of pages processed
    """
    try:
        # Open input PDF
        input_doc = fitz.open(input_path)
        total_pages = len(input_doc)
        
        logger.info(
            f"Processing {total_pages} pages with OCR "
            f"(language: {language}, dpi: {dpi})"
        )
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            input_doc.close()
            raise ValueError(
                f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}"
            )
        
        # Create output PDF
        output_doc = fitz.open()
        
        # Calculate zoom for DPI
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        
        # Process each page
        for page_num in range(total_pages):
            page = input_doc[page_num]
            
            # Render page to image
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Perform OCR to get text and bounding boxes
            ocr_data = pytesseract.image_to_pdf_or_hocr(
                img,
                lang=language,
                extension='pdf'
            )
            
            # Open OCR result as PDF page
            ocr_pdf = fitz.open("pdf", ocr_data)
            
            # Add OCR page to output
            output_doc.insert_pdf(ocr_pdf)
            ocr_pdf.close()
            
            logger.debug(f"Processed page {page_num + 1}/{total_pages} with OCR")
        
        input_doc.close()
        
        # Save searchable PDF
        output_doc.save(output_path, garbage=4, deflate=True)
        output_doc.close()
        
        logger.info(f"Successfully created searchable PDF with {total_pages} pages")
        return total_pages
        
    except Exception as e:
        logger.error(f"Failed to perform OCR on PDF: {e}")
        raise Exception(f"OCR processing failed: {str(e)}")


def extract_text_with_ocr(
    input_path: Path,
    language: str = "eng",
    page_range: Optional[str] = None,
    dpi: int = 300
) -> Tuple[str, int]:
    """
    Extract text from scanned PDF using OCR.
    
    Args:
        input_path: Input PDF file path
        language: Tesseract language code
        page_range: Optional page range like "1-3,5"
        dpi: DPI for OCR processing
        
    Returns:
        Tuple of (extracted_text, pages_processed)
    """
    try:
        # Open PDF
        doc = fitz.open(input_path)
        total_pages = len(doc)
        
        logger.info(f"Extracting text with OCR from {total_pages} pages")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(
                f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}"
            )
        
        # Parse page range
        pages_to_process = parse_page_range(page_range, total_pages)
        logger.info(f"Processing {len(pages_to_process)} pages with OCR")
        
        # Calculate zoom for DPI
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        
        extracted_text = []
        
        # Process each page
        for page_num in pages_to_process:
            page = doc[page_num]
            
            # Render page to image
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Perform OCR
            text = pytesseract.image_to_string(img, lang=language)
            
            if text.strip():
                extracted_text.append(f"--- Page {page_num + 1} ---\n{text}\n")
            
            logger.debug(f"OCR extracted {len(text)} chars from page {page_num + 1}")
        
        doc.close()
        
        # Combine all text
        full_text = "\n".join(extracted_text)
        
        logger.info(
            f"Successfully extracted {len(full_text)} characters "
            f"from {len(pages_to_process)} pages using OCR"
        )
        
        return full_text, len(pages_to_process)
        
    except Exception as e:
        logger.error(f"Failed to extract text with OCR: {e}")
        raise Exception(f"OCR text extraction failed: {str(e)}")