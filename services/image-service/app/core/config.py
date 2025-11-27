# app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """Application configuration"""
    
    # Redis Configuration
    REDIS_URL: str = "redis://redis:6379"  # Changed to use service name
    
    # File Upload Limits
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_BATCH_SIZE: int = 2
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Server Configuration
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    
    # CORS Configuration - Fixed to handle string input
    ALLOWED_ORIGINS: str = "*"  # Changed from List[str] to str
    
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
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra fields in .env
    )
    
    def get_allowed_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string to list"""
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()