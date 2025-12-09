"""
============================================================================
FILE: app/services/pymupdf/images_to_pdf.py
PURPOSE: Convert images to PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import List
import fitz  # PyMuPDF
from PIL import Image
import io

from app.core.logging import get_logger

logger = get_logger(__name__)


def images_to_pdf(image_paths: List[Path], output_path: Path) -> None:
    """
    Convert multiple images to a single PDF.
    
    Args:
        image_paths: List of image file paths
        output_path: Output PDF file path
    """
    if not image_paths:
        raise ValueError("At least one image is required")
    
    try:
        # Create new PDF document
        doc = fitz.open()
        
        for idx, img_path in enumerate(image_paths, start=1):
            logger.debug(f"Processing image {idx}/{len(image_paths)}: {img_path.name}")
            
            # Open image with PIL for better format support
            img = Image.open(img_path)
            
            # Convert to RGB if necessary
            if img.mode not in ['RGB', 'L']:
                img = img.convert('RGB')
            
            # Get image dimensions
            width, height = img.size
            
            # Create PDF page with image dimensions
            # A4 at 72 DPI: 595x842 points
            # Scale image to fit A4 if too large
            max_width = 595
            max_height = 842
            
            scale = min(max_width / width, max_height / height, 1.0)
            pdf_width = width * scale
            pdf_height = height * scale
            
            # Create new page
            page = doc.new_page(width=pdf_width, height=pdf_height)
            
            # Convert PIL image to bytes
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Insert image into page
            page.insert_image(
                page.rect,
                stream=img_bytes.getvalue(),
                keep_proportion=True
            )
            
            logger.debug(f"Added page {idx} ({width}x{height} -> {pdf_width:.0f}x{pdf_height:.0f})")
        
        # Save PDF
        doc.save(output_path, garbage=4, deflate=True, clean=True)
        doc.close()
        
        logger.info(f"Successfully created PDF with {len(image_paths)} pages -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to convert images to PDF: {e}")
        raise Exception(f"Images to PDF conversion failed: {str(e)}")