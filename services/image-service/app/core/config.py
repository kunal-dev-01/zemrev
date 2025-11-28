# =====================================================
# APPLICATION CONFIGURATION
# =====================================================

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Application configuration loaded from environment"""
    
    # =====================================================
    # REDIS CONFIGURATION
    # =====================================================
    REDIS_URL: str = "redis://redis:6379"
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_KEEPALIVE: bool = True
    
    # =====================================================
    # QUEUE CONFIGURATION
    # =====================================================
    QUEUE_NAME: str = "image_conversion"
    QUEUE_MAX_WORKERS: int = 4
    QUEUE_MAX_RETRIES: int = 3
    QUEUE_RETRY_DELAY: int = 5  # seconds
    QUEUE_JOB_TIMEOUT: int = 300  # seconds
    
    # =====================================================
    # FILE UPLOAD LIMITS
    # =====================================================
    MAX_FILE_SIZE: int = 52428800  # 50MB
    MAX_BATCH_SIZE: int = 10
    MAX_DIMENSION: int = 10000  # pixels
    
    # =====================================================
    # RATE LIMITING
    # =====================================================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    RATE_LIMIT_BURST: int = 20
    
    # =====================================================
    # SERVER CONFIGURATION
    # =====================================================
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False
    
    # =====================================================
    # CORS CONFIGURATION
    # =====================================================
    ALLOWED_ORIGINS: str = "*"
    
    # =====================================================
    # SECURITY
    # =====================================================
    SECRET_KEY: str = "change-this-in-production"
    API_KEY_REQUIRED: bool = False
    
    # =====================================================
    # MONITORING
    # =====================================================
    HEALTH_CHECK_INTERVAL: int = 30
    SENTRY_DSN: str = ""
    
    # =====================================================
    # PYVIPS OPTIMIZATION
    # =====================================================
    VIPS_CONCURRENCY: int = 4
    VIPS_DISC_THRESHOLD: str = "100m"
    VIPS_NOVECTOR: int = 0
    
    # =====================================================
    # SUPPORTED FORMATS (auto-detected on startup)
    # =====================================================
    INPUT_FORMATS: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/tiff",
        "image/gif",
        "image/bmp",
        "image/heic",
        "image/heif",
        "image/svg+xml",
    ]
    
    OUTPUT_FORMATS: List[str] = []  # Auto-populated on startup
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    # =====================================================
    # HELPER METHODS
    # =====================================================
    
    def get_allowed_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string to list"""
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.LOG_LEVEL.lower() in ["info", "warning", "error"]
    
    def get_redis_config(self) -> dict:
        """Get Redis connection configuration"""
        return {
            "url": self.REDIS_URL,
            "max_connections": self.REDIS_MAX_CONNECTIONS,
            "socket_timeout": self.REDIS_SOCKET_TIMEOUT,
            "socket_keepalive": self.REDIS_SOCKET_KEEPALIVE,
            "decode_responses": True
        }

# =====================================================
# GLOBAL SETTINGS INSTANCE
# =====================================================
settings = Settings()

# =====================================================
# SET PYVIPS ENVIRONMENT VARIABLES
# =====================================================
os.environ["VIPS_CONCURRENCY"] = str(settings.VIPS_CONCURRENCY)
os.environ["VIPS_DISC_THRESHOLD"] = settings.VIPS_DISC_THRESHOLD
os.environ["VIPS_NOVECTOR"] = str(settings.VIPS_NOVECTOR)