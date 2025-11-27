# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application configuration"""
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # File Upload Limits
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_BATCH_SIZE: int = 2
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Server Configuration
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Supported Input Formats (ALL libvips formats)
    INPUT_FORMATS: List[str] = [
        # Common formats
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        # Additional formats
        "image/tiff",
        "image/gif",
        "image/bmp",
        "image/x-bmp",
        "image/x-ms-bmp",
        # HEIC/HEIF (iPhone photos)
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence",
        # SVG
        "image/svg+xml",
        # Advanced formats
        "image/x-portable-pixmap",    # PPM
        "image/x-portable-graymap",   # PGM
        "image/x-portable-bitmap",    # PBM
        "image/x-hdr",                # HDR
        "application/fits",           # FITS
    ]
    
    # Supported Output Formats
    OUTPUT_FORMATS: List[str] = [
        "webp",
        "avif",
        "jpeg",
        "png",
        "tiff",
        "gif",
        "bmp",
        "heif",
        "ppm"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()