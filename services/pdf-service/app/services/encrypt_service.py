"""
============================================================================
FILE: app/services/encrypt_service.py
PURPOSE: PDF encryption operations
============================================================================
"""

from pathlib import Path
from typing import Optional
from pypdf import PdfWriter, PdfReader
from app.core.logging import get_logger

logger = get_logger(__name__)


def encrypt_pdf(
    input_path: Path,
    output_path: Path,
    user_password: Optional[str] = None,
    owner_password: Optional[str] = None
) -> None:
    """
    Encrypt a PDF with password protection.
    
    Args:
        input_path: Input PDF file path
        output_path: Output PDF file path
        user_password: Password for opening the PDF (optional)
        owner_password: Password for permissions (optional)
        
    Raises:
        Exception: If encryption fails
    """
    # At least one password must be provided
    if not user_password and not owner_password:
        raise ValueError("At least one password (user or owner) must be provided")
    
    # Default to same password if only one provided
    if user_password and not owner_password:
        owner_password = user_password
    elif owner_password and not user_password:
        user_password = ""  # Empty user password, but has owner password
    
    try:
        # Read input PDF
        with open(input_path, 'rb') as f:
            reader = PdfReader(f, strict=False)
            writer = PdfWriter()
            
            # Copy all pages
            for page in reader.pages:
                writer.add_page(page)
            
            # Apply encryption
            # By default, this will restrict printing and copying
            writer.encrypt(
                user_password=user_password,
                owner_password=owner_password,
                permissions_flag=0b0000  # No permissions (printing, copying disabled)
            )
            
            # Write encrypted PDF
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            logger.info(f"Successfully encrypted PDF -> {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to encrypt PDF: {e}")
        raise Exception(f"PDF encryption failed: {str(e)}")