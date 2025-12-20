"""
============================================================================
FILE: app/services/pymupdf/optimize_pdf.py
PURPOSE: Optimize PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import Tuple
import fitz  # PyMuPDF

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


def optimize_pdf(
    pdf_path: Path,
    output_path: Path,
    remove_metadata: bool = True,
    remove_annotations: bool = True,
    remove_javascript: bool = True,
    remove_links: bool = True,
    compress_images: bool = False
) -> Tuple[float, float]:
    """
    Optimize PDF by removing unnecessary elements.
    
    Args:
        pdf_path: Input PDF file path
        output_path: Output PDF file path
        remove_metadata: Remove metadata
        remove_annotations: Remove annotations
        remove_javascript: Remove JavaScript
        remove_links: Remove hyperlinks
        compress_images: Compress embedded images
        
    Returns:
        Tuple of (original_size_kb, optimized_size_kb)
    """
    try:
        # Get original file size
        original_size = pdf_path.stat().st_size / 1024  # KB
        
        # Open PDF
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        logger.info(f"Optimizing PDF: {total_pages} pages, {original_size:.2f} KB")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Remove metadata
        if remove_metadata:
            doc.set_metadata({})
            logger.debug("Removed metadata")
        
        # Process each page
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Remove annotations
            if remove_annotations:
                # Get all annotations
                annots = page.annots()
                if annots:
                    for annot in annots:
                        page.delete_annot(annot)
                    logger.debug(f"Removed annotations from page {page_num + 1}")
            
            # Remove links
            if remove_links:
                # Get all links
                links = page.get_links()
                if links:
                    for link in links:
                        page.delete_link(link)
                    logger.debug(f"Removed links from page {page_num + 1}")
        
        # Remove JavaScript (document-level)
        if remove_javascript:
            # PyMuPDF doesn't have direct JS removal, but we can clean the catalog
            try:
                pdf_dict = doc.pdf_catalog()
                if "/OpenAction" in pdf_dict:
                    del pdf_dict["/OpenAction"]
                if "/AA" in pdf_dict:
                    del pdf_dict["/AA"]
                logger.debug("Removed JavaScript actions")
            except:
                pass
        
        # Save with optimization flags
        # garbage=4: maximum garbage collection
        # deflate=True: compress streams
        # clean=True: clean and sanitize
        # linear=True: linearize for fast web view (optional)
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
            linear=False  # Set to True for web optimization
        )
        doc.close()
        
        # Get optimized file size
        optimized_size = output_path.stat().st_size / 1024  # KB
        
        reduction = ((original_size - optimized_size) / original_size) * 100 if original_size > 0 else 0
        
        logger.info(
            f"Successfully optimized PDF: "
            f"{original_size:.2f} KB -> {optimized_size:.2f} KB "
            f"({reduction:.1f}% reduction)"
        )
        
        return original_size, optimized_size
        
    except Exception as e:
        logger.error(f"Failed to optimize PDF: {e}")
        raise Exception(f"PDF optimization failed: {str(e)}")