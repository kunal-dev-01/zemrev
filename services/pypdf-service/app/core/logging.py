"""
============================================================================
FILE: app/core/logging.py
PURPOSE: Logging configuration
============================================================================
"""

import logging
from app.core.config import settings

def setup_logging():
    """Configure logging for the application"""
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

def get_logger(name: str) -> logging.Logger:
    """Get logger instance"""
    return logging.getLogger(name)