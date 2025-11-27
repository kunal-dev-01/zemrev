# Image converter

import pyvips
from app.models.schemas import ConversionRequest
import logging

logger = logging.getLogger(__name__)

class ImageConverter:
    @staticmethod
    def convert(content: bytes, filename: str, options: ConversionRequest):
        image = pyvips.Image.new_from_buffer(content, access="sequential")

        if options.width or options.height:
            image = ImageConverter._resize(image, options.width, options.height)

        buffer = ImageConverter._save(image, options)
        name = filename.rsplit(".", 1)[0] + f".{options.format}"

        return buffer, name

    @staticmethod
    def _save(img: pyvips.Image, opt: ConversionRequest):
        handlers = {
            "webp": lambda: img.webpsave_buffer(Q=opt.quality, strip=True),
            "avif": lambda: img.heifsave_buffer(Q=opt.quality, compression="av1"),
            "jpeg": lambda: img.jpegsave_buffer(Q=opt.quality, strip=True),
            "png": lambda: img.pngsave_buffer(compression=9, strip=True),
            "tiff": lambda: img.tiffsave_buffer(compression="lzw", Q=opt.quality),
            "gif": lambda: img.gifsave_buffer(),
            "bmp": lambda: img.magicksave_buffer(format="BMP"),
            "heif": lambda: img.heifsave_buffer(Q=opt.quality, compression="hevc"),
            "ppm": lambda: img.ppmsave_buffer(),
        }

        func = handlers.get(opt.format)
        if not func:
            raise ValueError("Unsupported format")

        return func()

    @staticmethod
    def _resize(img, width, height):
        if width and height:
            return img.thumbnail_image(width, height=height, size=pyvips.Size.FORCE)
        if width:
            return img.thumbnail_image(width)
        if height:
            scale = height / img.height
            return img.resize(scale)
        return img

converter = ImageConverter()
