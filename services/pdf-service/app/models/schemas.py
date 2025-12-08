"""
============================================================================
FILE: app/models/schemas.py
PURPOSE: Pydantic models
============================================================================
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================



# ============================================================================
# REQUESTS
# ============================================================================



  

# ============================================================================
# RESPONSES
# ============================================================================

class ErrorResponse(BaseModel):
    """Error"""
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check"""
    status: str
    redis: str
    queue_size: int
    workers: int