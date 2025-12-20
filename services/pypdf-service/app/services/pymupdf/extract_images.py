"""
============================================================================
FILE: app/services/pymupdf/extract_images.py
PURPOSE: Extract images from PDF using PyMuPDF
============================================================================
"""

from pathlib import Path
from typing import List, Optional
import fitz  # PyMuPDF
from PIL import Image
import io

from app.core.logging import get_logger
from app.core.config import settings
from app.services.pymupdf.pdf_to_images import parse_page_range

logger = get_logger(__name__)


def extract_images_from_pdf(
    pdf_path: Path,
    output_dir: Path,
    page_range: Optional[str] = None,
    min_width: int = 100,
    min_height: int = 100
) -> List[Path]:
    """
    Extract images from PDF.
    
    Args:
        pdf_path: Input PDF file path
        output_dir: Output directory for images
        page_range: Optional page range like "1-3,5"
        min_width: Minimum image width to extract
        min_height: Minimum image height to extract
        
    Returns:
        List of extracted image file paths
    """
    output_paths = []
    image_counter = 1
    
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        logger.info(f"Extracting images from PDF: {total_pages} pages")
        
        # Validate page count
        if total_pages > settings.MAX_PAGES:
            doc.close()
            raise ValueError(f"PDF has too many pages. Max: {settings.MAX_PAGES}, got: {total_pages}")
        
        # Parse page range
        pages_to_extract = parse_page_range(page_range, total_pages)
        logger.info(f"Scanning {len(pages_to_extract)} pages for images")
        
        # Extract images from each page
        for page_num in pages_to_extract:
            page = doc[page_num]
            
            # Get list of images on this page
            image_list = page.get_images(full=True)
            
            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]  # Image xref
                
                # Extract image
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Open with PIL to check dimensions
                img = Image.open(io.BytesIO(image_bytes))
                width, height = img.size
                
                # Filter by size
                if width < min_width or height < min_height:
                    logger.debug(
                        f"Skipping small image on page {page_num + 1}: "
                        f"{width}x{height}px (min: {min_width}x{min_height})"
                    )
                    continue
                
                # Save image
                output_path = output_dir / f"image_{image_counter:03d}.{image_ext}"
                
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                output_paths.append(output_path)
                logger.debug(
                    f"Extracted image {image_counter} from page {page_num + 1}: "
                    f"{width}x{height}px -> {output_path.name}"
                )
                
                image_counter += 1
        
        doc.close()
        
        logger.info(f"Successfully extracted {len(output_paths)} images")
        
        return output_paths
        
    except Exception as e:
        logger.error(f"Failed to extract images from PDF: {e}")
        # Cleanup any created files
        for path in output_paths:
            try:
                path.unlink()
            except:
                pass
        raise Exception(f"Image extraction failed: {str(e)}")