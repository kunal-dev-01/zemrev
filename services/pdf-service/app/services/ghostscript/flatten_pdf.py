"""
============================================================================
FILE: app/services/ghostscript/flatten_pdf.py
PURPOSE: Flatten PDF (remove layers, transparency) using Ghostscript
============================================================================
"""

from pathlib import Path
import subprocess

from app.core.logging import get_logger

logger = get_logger(__name__)


def flatten_pdf_ghostscript(input_path: Path, output_path: Path) -> None:
    """
    Flatten PDF - removes layers, transparency, and forms.
    Converts everything to static content.
    
    Args:
        input_path: Input PDF file path
        output_path: Output PDF file path
    """
    try:
        logger.info(f"Flattening PDF with Ghostscript")
        
        # Build Ghostscript command for flattening
        gs_command = [
            "gs",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dPDFSETTINGS=/prepress",  # High quality for flattening
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            # Flattening settings
            "-dAutoRotatePages=/None",
            "-dPreserveAnnots=false",  # Remove annotations
            "-dPreserveSMask=false",   # Remove transparency
            "-dFlattenTransparency=true",
            "-dDetectDuplicateImages=true",
            f"-sOutputFile={output_path}",
            str(input_path)
        ]
        
        # Run Ghostscript
        result = subprocess.run(
            gs_command,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown Ghostscript error"
            raise Exception(f"Ghostscript failed: {error_msg}")
        
        # Check if output file was created
        if not output_path.exists():
            raise Exception("Ghostscript did not create output file")
        
        # Get file sizes
        original_size = input_path.stat().st_size / 1024
        flattened_size = output_path.stat().st_size / 1024
        
        logger.info(
            f"Successfully flattened PDF: "
            f"{original_size:.2f} KB → {flattened_size:.2f} KB"
        )
        
    except subprocess.TimeoutExpired:
        logger.error("Ghostscript flattening timed out")
        raise Exception("PDF flattening timed out (file too large)")
    except Exception as e:
        logger.error(f"Failed to flatten PDF with Ghostscript: {e}")
        raise Exception(f"PDF flattening failed: {str(e)}")