"""
============================================================================
FILE: utils/file_io.py
PURPOSE: File I/O utilities
============================================================================
"""

from pathlib import Path
import tempfile
import shutil
from typing import List
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def create_temp_pdf_path(prefix: str = "output") -> Path:
    """
    Create a temporary PDF file path.
    
    Args:
        prefix: Filename prefix
        
    Returns:
        Path to temporary file
    """
    temp_file = tempfile.NamedTemporaryFile(
        mode='wb',
        delete=False,
        suffix='.pdf',
        prefix=f"{prefix}_",
        dir=settings.UPLOAD_DIR
    )
    temp_file.close()
    return Path(temp_file.name)


def safe_remove(path: Path) -> None:
    """
    Safely remove a file, catching and logging errors.
    
    Args:
        path: File path to remove
    """
    try:
        if path.exists():
            path.unlink()
            logger.debug(f"Removed temp file: {path}")
    except Exception as e:
        logger.warning(f"Failed to remove temp file {path}: {e}")


def safe_remove_multiple(paths: List[Path]) -> None:
    """
    Safely remove multiple files.
    
    Args:
        paths: List of file paths to remove
    """
    for path in paths:
        safe_remove(path)


def create_zip_from_pdfs(pdf_paths: List[Path], zip_prefix: str = "split") -> Path:
    """
    Create a ZIP archive from multiple PDF files.
    
    Args:
        pdf_paths: List of PDF file paths
        zip_prefix: Prefix for ZIP filename
        
    Returns:
        Path to created ZIP file
    """
    # Create temp directory for organizing files
    temp_dir = tempfile.mkdtemp(dir=settings.UPLOAD_DIR)
    temp_dir_path = Path(temp_dir)
    
    try:
        # Copy PDFs to temp directory with sequential names
        for idx, pdf_path in enumerate(pdf_paths, start=1):
            dest = temp_dir_path / f"page_{idx}.pdf"
            shutil.copy2(pdf_path, dest)
        
        # Create ZIP archive
        zip_base = tempfile.mktemp(dir=settings.UPLOAD_DIR, prefix=f"{zip_prefix}_")
        zip_path = shutil.make_archive(
            base_name=zip_base,
            format='zip',
            root_dir=temp_dir_path
        )
        
        logger.info(f"Created ZIP archive: {zip_path} ({len(pdf_paths)} files)")
        return Path(zip_path)
        
    finally:
        # Clean up temp directory
        try:
            shutil.rmtree(temp_dir_path)
        except Exception as e:
            logger.warning(f"Failed to remove temp directory {temp_dir_path}: {e}")