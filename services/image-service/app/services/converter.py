import pyvips
from app.models.schemas import ConversionRequest
import logging

logger = logging.getLogger(__name__)

class ImageConverter:
    """
    Ultra-fast image converter using PyVips (libvips)
    All operations are in-memory with zero disk I/O
    """
    
    @staticmethod
    def convert(
        content: bytes,
        filename: str,
        options: ConversionRequest
    ) -> tuple[bytes, str]:
        """
        Convert image from buffer to specified format
        
        Args:
            content: Raw image bytes
            filename: Original filename
            options: Conversion parameters
            
        Returns:
            (converted_bytes, new_filename)
            
        Raises:
            Exception: If conversion fails
        """
        try:
            # Load image from memory buffer
            image = pyvips.Image.new_from_buffer(content, "")
            
            # Log original image info
            logger.info(f"Processing {filename}: {image.width}x{image.height}, {image.bands} bands")
            
            # Handle GIF - only first frame supported
            if "gif" in filename.lower():
                logger.debug(f"GIF detected: {filename} - extracting first frame")
            
            # Resize if dimensions specified
            if options.width or options.height:
                image = ImageConverter._resize_image(
                    image,
                    options.width,
                    options.height
                )
                logger.debug(f"Resized to {image.width}x{image.height}")
            
            # Convert to target format
            output_buffer = ImageConverter._save_image(image, options)
            
            # Generate new filename
            name_without_ext = filename.rsplit(".", 1)[0]
            new_filename = f"{name_without_ext}.{options.format}"
            
            logger.info(f"Converted {filename} → {new_filename} ({len(output_buffer)} bytes)")
            
            return output_buffer, new_filename
            
        except Exception as e:
            logger.error(f"Conversion failed for {filename}: {str(e)}")
            raise Exception(f"Image conversion failed: {str(e)}")
    
    @staticmethod
    def _save_image(image: pyvips.Image, options: ConversionRequest) -> bytes:
        """
        Save image to buffer in specified format
        Supports all libvips-compatible formats
        """
        format_handlers = {
            "webp": lambda: image.webpsave_buffer(
                Q=options.quality,
                strip=True,
                effort=4
            ),
            
            "avif": lambda: image.heifsave_buffer(
                Q=options.quality,
                compression="av1",
                effort=4
            ),
            
            "jpeg": lambda: image.jpegsave_buffer(
                Q=options.quality,
                strip=True,
                optimize_coding=True
            ),
            
            "png": lambda: image.pngsave_buffer(
                compression=9,
                interlace=False,
                strip=True
            ),
            
            "tiff": lambda: image.tiffsave_buffer(
                compression="lzw",
                Q=options.quality
            ),
            
            "gif": lambda: image.gifsave_buffer(),
            
            "bmp": lambda: image.magicksave_buffer(format="BMP"),
            
            "heif": lambda: image.heifsave_buffer(
                Q=options.quality,
                compression="hevc"
            ),
            
            "ppm": lambda: image.ppmsave_buffer(),
        }
        
        save_func = format_handlers.get(options.format)
        
        if not save_func:
            raise ValueError(f"Unsupported output format: {options.format}")
        
        return save_func()
    
    @staticmethod
    def _resize_image(
        image: pyvips.Image,
        width: int | None,
        height: int | None
    ) -> pyvips.Image:
        """
        Resize image with smart aspect ratio handling
        
        Args:
            image: Source image
            width: Target width (optional)
            height: Target height (optional)
            
        Returns:
            Resized image
        """
        
        if width and height:
            # Both dimensions specified - force exact size
            return image.thumbnail_image(
                width,
                height=height,
                size=pyvips.Size.FORCE
            )
        
        elif width:
            # Width only - maintain aspect ratio
            return image.thumbnail_image(width)
        
        elif height:
            # Height only - calculate scale factor
            scale = height / image.height
            return image.resize(scale)
        
        return image

# Global converter instance
converter = ImageConverter()