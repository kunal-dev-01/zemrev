# ============================================================================
# FILE: app/core/config.py
# PURPOSE: Application configuration with environment variables
# COMMIT: feat: add production-ready configuration with optimized defaults
# ============================================================================

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    # ========================================================================
    # REDIS CONFIGURATION
    # ========================================================================
    REDIS_URL: str = "redis://redis:6379"
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_KEEPALIVE: bool = True
    
    # ========================================================================
    # QUEUE CONFIGURATION
    # ========================================================================
    QUEUE_NAME: str = "image_jobs"
    QUEUE_MAX_WORKERS: int = 4
    QUEUE_MAX_RETRIES: int = 2
    QUEUE_RETRY_DELAY: int = 3
    QUEUE_JOB_TIMEOUT: int = 300
    QUEUE_RESULT_TTL: int = 300  # 5 minutes
    
    # ========================================================================
    # FILE LIMITS
    # ========================================================================
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_BATCH_SIZE: int = 10
    MAX_DIMENSION: int = 10000
    MAX_URL_SIZE: int = 52428800  # 50MB for URL downloads
    URL_TIMEOUT: int = 30  # seconds
    
    # ========================================================================
    # RATE LIMITING
    # ========================================================================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60
    
    # ========================================================================
    # SERVER CONFIGURATION
    # ========================================================================
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # ========================================================================
    # CORS
    # ========================================================================
    ALLOWED_ORIGINS: str = "*"
    
    # ========================================================================
    # SECURITY
    # ========================================================================
    SECRET_KEY: str = "change-in-production"
    
    # ========================================================================
    # PYVIPS OPTIMIZATION
    # ========================================================================
    VIPS_CONCURRENCY: int = 4
    VIPS_DISC_THRESHOLD: str = "100m"
    VIPS_NOVECTOR: int = 0
    
    # ========================================================================
    # ENGINE PREFERENCES
    # ========================================================================
    PREFER_PYVIPS: bool = True  # PyVips优先（更快，更省资源）
    FALLBACK_TO_PILLOW: bool = True  # PyVips失败时使用Pillow
    
    # ========================================================================
    # MODEL CONFIG
    # ========================================================================
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def get_allowed_origins(self) -> List[str]:
        """Parse CORS origins"""
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
    
    def is_production(self) -> bool:
        """Check if production mode"""
        return self.LOG_LEVEL.lower() in ["info", "warning", "error"]

# ============================================================================
# GLOBAL SETTINGS INSTANCE
# ============================================================================
settings = Settings()

# ============================================================================
# SET PYVIPS ENVIRONMENT VARIABLES
# ============================================================================
os.environ["VIPS_CONCURRENCY"] = str(settings.VIPS_CONCURRENCY)
os.environ["VIPS_DISC_THRESHOLD"] = settings.VIPS_DISC_THRESHOLD
os.environ["VIPS_NOVECTOR"] = str(settings.VIPS_NOVECTOR)