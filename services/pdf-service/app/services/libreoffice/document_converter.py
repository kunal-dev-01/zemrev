"""
============================================================================
FILE: app/services/libreoffice/document_converter.py
PURPOSE: Document conversion using LibreOffice
============================================================================
"""

from pathlib import Path
import subprocess
import tempfile

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


def convert_to_pdf_libreoffice(input_path: Path, output_dir: Path) -> Path:
    """
    Convert document to PDF using LibreOffice.
    
    Supports: DOCX, DOC, HTML, XLSX, XLS, PPTX, PPT, ODT, ODS, ODP, RTF, TXT
    
    Args:
        input_path: Input document file path
        output_dir: Output directory for PDF
        
    Returns:
        Path to generated PDF file
    """
    try:
        input_name = input_path.stem
        logger.info(f"Converting {input_path.name} to PDF with LibreOffice")
        
        # Build LibreOffice command
        # --headless: run without GUI
        # --convert-to pdf: convert to PDF format
        # --outdir: output directory
        libreoffice_command = [
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(output_dir),
            str(input_path)
        ]
        
        # Run LibreOffice
        result = subprocess.run(
            libreoffice_command,
            capture_output=True,
            text=True,
            timeout=120  # 2 minutes timeout
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown LibreOffice error"
            raise Exception(f"LibreOffice conversion failed: {error_msg}")
        
        # LibreOffice creates output with .pdf extension
        output_path = output_dir / f"{input_name}.pdf"
        
        if not output_path.exists():
            raise Exception("LibreOffice did not create output PDF")
        
        logger.info(f"Successfully converted to PDF: {output_path}")
        return output_path
        
    except subprocess.TimeoutExpired:
        logger.error("LibreOffice conversion timed out")
        raise Exception("Document conversion timed out (file too large or complex)")
    except Exception as e:
        logger.error(f"Failed to convert document to PDF: {e}")
        raise Exception(f"Document to PDF conversion failed: {str(e)}")


def convert_pdf_to_docx_libreoffice(input_path: Path, output_dir: Path) -> Path:
    """
    Convert PDF to DOCX using LibreOffice.
    
    Args:
        input_path: Input PDF file path
        output_dir: Output directory for DOCX
        
    Returns:
        Path to generated DOCX file
    """
    try:
        input_name = input_path.stem
        logger.info(f"Converting {input_path.name} to DOCX with LibreOffice")
        
        # Build LibreOffice command
        libreoffice_command = [
            "libreoffice",
            "--headless",
            "--convert-to", "docx",
            "--outdir", str(output_dir),
            str(input_path)
        ]
        
        # Run LibreOffice
        result = subprocess.run(
            libreoffice_command,
            capture_output=True,
            text=True,
            timeout=120  # 2 minutes timeout
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown LibreOffice error"
            raise Exception(f"LibreOffice conversion failed: {error_msg}")
        
        # LibreOffice creates output with .docx extension
        output_path = output_dir / f"{input_name}.docx"
        
        if not output_path.exists():
            raise Exception("LibreOffice did not create output DOCX")
        
        logger.info(f"Successfully converted to DOCX: {output_path}")
        return output_path
        
    except subprocess.TimeoutExpired:
        logger.error("LibreOffice conversion timed out")
        raise Exception("PDF to DOCX conversion timed out")
    except Exception as e:
        logger.error(f"Failed to convert PDF to DOCX: {e}")
        raise Exception(f"PDF to DOCX conversion failed: {str(e)}")