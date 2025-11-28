# ============================================================================
# FILE: app/core/config.py
# PURPOSE: Application configuration from environment variables
# COMMIT: feat: add production-ready settings with optimal defaults
# ============================================================================

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
    QUEUE_NAME: str = "image_jobs"
    QUEUE_MAX_WORKERS: int = 4
    QUEUE_MAX_RETRIES: int = 2
    QUEUE_JOB_TIMEOUT: int = 300
    QUEUE_RESULT_TTL: int = 300  # Auto-delete after 5 min
    
    # File limits
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_BATCH_SIZE: int = 2  # Only 2 images per batch
    MAX_DIMENSION: int = 10000
    
    # URL downloads
    MAX_URL_SIZE: int = 52428800  # 50MB
    URL_TIMEOUT: int = 30
    
    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60
    
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

# Global instance
settings = Settings()

# Set PyVips environment
os.environ["VIPS_CONCURRENCY"] = str(settings.VIPS_CONCURRENCY)
os.environ["VIPS_DISC_THRESHOLD"] = settings.VIPS_DISC_THRESHOLD