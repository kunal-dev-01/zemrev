# Routes (Thin Layer)

from fastapi import APIRouter, UploadFile, File, Depends, Request, Query
from fastapi.responses import Response
from typing import List
from app.api.controllers.image_controller import ImageController
from app.core.rate_limiter import rate_limiter

router = APIRouter(prefix="/api/v1", tags=["Image Conversion"])

async def rate_limit(request: Request):
    await rate_limiter.check_rate_limit(request)

@router.post("/convert", response_class=Response)
async def convert(
    request: Request,
    files: List[UploadFile] = File(...),
    format: str = Query("webp"),
    quality: int = Query(85, ge=1, le=100),
    width: int | None = Query(None),
    height: int | None = Query(None),
    _: None = Depends(rate_limit)
):
    return await ImageController.convert_images(files, format, quality, width, height)

@router.get("/formats")
async def formats():
    return await ImageController.get_formats()
