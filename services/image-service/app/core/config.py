"""
============================================================================
FILE: app/core/config.py
PURPOSE: Production-ready configuration
============================================================================
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_SOCKET_TIMEOUT: int = 5
    
    # Queue
    QUEUE_NAME: str = "zemrev_jobs"
    QUEUE_MAX_WORKERS: int = 4
    QUEUE_MAX_RETRIES: int = 3
    QUEUE_JOB_TIMEOUT: int = 600  # 10 minutes
    QUEUE_RESULT_TTL: int = 300   # 5 minutes (auto-delete)
    
    # File limits
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_DIMENSION: int = 15000
    
    # URL downloads
    MAX_URL_SIZE: int = 52428800
    URL_TIMEOUT: int = 30
    
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