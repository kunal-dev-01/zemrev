"""
============================================================================
FILE: services/pdf-service/app/core/config.py
PURPOSE: PDF Service configuration
============================================================================
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    # File limits
    MAX_FILE_SIZE: int = 209715200 # 300MB
    MAX_PAGES: int = 2000
    
    # Paths
    UPLOAD_DIR: str = "/tmp/zemrev_pdf_uploads"
    
    # Server
    LOG_LEVEL: str = "info"
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    
    # CORS
    ALLOWED_ORIGINS: str = "*"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    def get_allowed_origins(self) -> List[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
    
    def ensure_upload_dir(self):
        """Create upload directory if it doesn't exist"""
        Path(self.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.ensure_upload_dir()