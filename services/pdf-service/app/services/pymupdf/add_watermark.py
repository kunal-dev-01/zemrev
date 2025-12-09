"""
============================================================================
FILE: services/pdf-service/app/services/pymupdf/add_watermark.py
PURPOSE: Add watermark to PDF using PyMuPDF
============================================================================
"""

# add_watermark.py  (crop-box aware, bottom-left origin)
from pathlib import Path
from typing import Tuple
import fitz
from PIL import Image, ImageDraw, ImageFont, ImageOps
import io, os, math

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

_COLOR_MAP = {
    'red': (1, 0, 0), 'blue': (0, 0, 1), 'green': (0, 1, 0),
    'black': (0, 0, 0), 'white': (1, 1, 1), 'gray': (0.5, 0.5, 0.5),
    'grey': (0.5, 0.5, 0.5), 'yellow': (1, 1, 0),
    'orange': (1, 0.65, 0), 'purple': (0.5, 0, 0.5)
}
_MARGIN_PT = 50   # margin in PDF points


# ---------- flip positions (frontend sends straight, backend shows opposite) ----------
_STRAIGHT_TO_OPPOSITE = {
    "top_left": "bottom_left",
    "top_right": "bottom_right",
    "bottom_left": "top_left",
    "bottom_right": "top_right",
    "center": "center"
}


# ---------- helpers ----------
def _load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]:
        if os.path.isfile(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _text_to_rgba(text: str, font: ImageFont.FreeTypeFont,
                  rgb: Tuple[int, int, int], opacity: float, rotation: int) -> Image.Image:
    """Return rotated text RGBA (bottom-left origin)."""
    dummy = Image.new("RGBA", (1, 1))
    draw = ImageDraw.Draw(dummy)
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    w, h = r - l, b - t
    pad = max(w, h) * 2
    canvas = Image.new("RGBA", (pad, pad), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.text((pad // 2, pad // 2), text, fill=(*rgb, int(255 * opacity)), font=font)
    rotated = canvas.rotate(rotation, expand=True, fillcolor=(0, 0, 0, 0))
    return rotated.crop(rotated.getbbox()) if rotated.getbbox() else rotated


def _calc_rect(rect: fitz.Rect, wm_w: float, wm_h: float, position: str) -> fitz.Rect:
    """Return fitted Rect inside page crop box (bottom-left origin)."""
    margin = _MARGIN_PT
    x0, y0, x1, y1 = rect.x0, rect.y0, rect.x1, rect.y1
    pw, ph = x1 - x0, y1 - y0

    if position == "center":
        cx = (pw - wm_w) / 2
        cy = (ph - wm_h) / 2
        return fitz.Rect(x0 + cx, y0 + cy, x0 + cx + wm_w, y0 + cy + wm_h)

    if position == "top_left":
        return fitz.Rect(x0 + margin,                       # left
                         y0 + ph - wm_h - margin,          # top (bottom + pageHeight - h)
                         x0 + margin + wm_w,
                         y0 + ph - margin)

    if position == "top_right":
        return fitz.Rect(x0 + pw - wm_w - margin,
                         y0 + ph - wm_h - margin,
                         x0 + pw - margin,
                         y0 + ph - margin)

    if position == "bottom_left":
        return fitz.Rect(x0 + margin,
                         y0 + margin,
                         x0 + margin + wm_w,
                         y0 + margin + wm_h)

    if position == "bottom_right":
        return fitz.Rect(x0 + pw - wm_w - margin,
                         y0 + margin,
                         x0 + pw - margin,
                         y0 + margin + wm_h)

    # fallback center
    cx = (pw - wm_w) / 2
    cy = (ph - wm_h) / 2
    return fitz.Rect(x0 + cx, y0 + cy, x0 + cx + wm_w, y0 + cy + wm_h)


# ---------- public ----------
def add_text_watermark(
    pdf_path: Path,
    output_path: Path,
    text: str,
    opacity: float = 0.3,
    position: str = "center",
    font_size: int = 50,
    rotation: int = 45,
    color: str = "gray",
) -> None:
    doc = fitz.open(pdf_path)
    if len(doc) > settings.MAX_PAGES:
        raise ValueError(f"Too many pages ({len(doc)}) – max {settings.MAX_PAGES}")

    # ---- flip position ----
    position = _STRAIGHT_TO_OPPOSITE.get(position, position)

    rgb = tuple(int(c * 255) for c in _COLOR_MAP.get(color.lower(), _COLOR_MAP["gray"]))
    font = _load_font(font_size)

    for page in doc:
        text_img = _text_to_rgba(text, font, rgb, opacity, rotation)
        wm_w, wm_h = text_img.width, text_img.height
        target_rect = _calc_rect(page.rect, wm_w, wm_h, position)

        buf = io.BytesIO()
        text_img.save(buf, format="PNG")
        page.insert_image(target_rect, stream=buf.getvalue(), overlay=True)

    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    logger.info("Text watermark added – %s", output_path)


def add_image_watermark(
    pdf_path: Path,
    output_path: Path,
    watermark_image_path: Path,
    opacity: float = 0.3,
    position: str = "center",
    scale: float = 0.3,
) -> None:
    doc = fitz.open(pdf_path)
    if len(doc) > settings.MAX_PAGES:
        raise ValueError(f"Too many pages ({len(doc)}) – max {settings.MAX_PAGES}")

    # ---- flip position ----
    position = _STRAIGHT_TO_OPPOSITE.get(position, position)

    wm: Image.Image = Image.open(watermark_image_path).convert("RGBA")
    if opacity < 1:
        alpha = wm.split()[-1].point(lambda p: int(p * opacity))
        wm.putalpha(alpha)

    for page in doc:
        rect = page.rect
        pw, ph = rect.width, rect.height
        ww = pw * scale
        wh = (wm.height / wm.width) * ww
        wm_scaled = wm.resize((int(ww), int(wh)), Image.LANCZOS)

        target_rect = _calc_rect(rect, wm_scaled.width, wm_scaled.height, position)

        buf = io.BytesIO()
        wm_scaled.save(buf, format="PNG")
        page.insert_image(target_rect, stream=buf.getvalue(), overlay=True)

    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    logger.info("Image watermark added - %s", output_path)