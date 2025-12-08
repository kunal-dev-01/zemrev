"""
============================================================================
FILE: app/core/config.py
PURPOSE: Image Service specific configuration
============================================================================
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Image Service settings"""
    
    # File limits
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_DIMENSION: int = 15000
    
    # Server
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: str = "*"
    
    # PyVips optimization
    VIPS_CONCURRENCY: int = 4
    VIPS_DISC_THRESHOLD: str = "100m"
    
    # Queue settings (imported from zemrev-queue package)
    # REDIS_URL, QUEUE_NAME, etc. are in zemrev_queue.config
    QUEUE_MAX_WORKERS: int = 4
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    def get_allowed_origins(self) -> List[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()

# Set PyVips environment
os.environ["VIPS_CONCURRENCY"] = str(settings.VIPS_CONCURRENCY)
os.environ["VIPS_DISC_THRESHOLD"] = settings.VIPS_DISC_THRESHOLD