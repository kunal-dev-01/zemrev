"""
============================================================================
FILE: services/pdf-service/app/services/decrypt_service.py
PURPOSE: PDF decryption operations
============================================================================
"""

from pathlib import Path
from pypdf import PdfWriter, PdfReader
from app.core.logging import get_logger

logger = get_logger(__name__)


def decrypt_pdf(
    input_path: Path,
    output_path: Path,
    password: str
) -> None:
    """
    Decrypt a password-protected PDF.
    
    Args:
        input_path: Input PDF file path
        output_path: Output PDF file path
        password: Password to decrypt the PDF
        
    Raises:
        Exception: If decryption fails or password is wrong
    """
    if not password:
        raise ValueError("Password is required for decryption")
    
    try:
        # Read encrypted PDF
        with open(input_path, 'rb') as f:
            reader = PdfReader(f, strict=False)
            
            # Check if PDF is encrypted
            if not reader.is_encrypted:
                raise ValueError("PDF is not encrypted")
            
            # Try to decrypt
            decrypt_result = reader.decrypt(password)
            
            # Check if decryption was successful
            # decrypt() returns:
            # 0 - failed
            # 1 - succeeded with user password
            # 2 - succeeded with owner password
            if decrypt_result == 0:
                raise ValueError("Incorrect password or decryption failed")
            
            logger.debug(f"Decryption successful (mode: {decrypt_result})")
            
            # Create writer and copy pages
            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)
            
            # Write decrypted PDF
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            logger.info(f"Successfully decrypted PDF -> {output_path}")
        
    except ValueError as e:
        # Re-raise validation errors
        logger.warning(f"Decryption validation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Failed to decrypt PDF: {e}")
        raise Exception(f"PDF decryption failed: {str(e)}")