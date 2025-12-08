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
    MAX_FILE_SIZE: int = 52428800
    MAX_DIMENSION: int = 15000
    WORKERS: int = 1
    LOG_LEVEL: str = "debug"
    HOST: str = "0.0.0.0"
    PORT: int = 8001
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
        
settings = Settings()        