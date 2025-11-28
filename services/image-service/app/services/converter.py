import pyvips
from app.models.schemas import ConversionRequest
from app.services.format_checker import format_checker
import logging

logger = logging.getLogger(__name__)

class ImageConverter:
    """Optimized image converter with format validation"""
    
    @staticmethod
    def convert(content: bytes, filename: str, options: ConversionRequest):
        """
        Convert image with optimal pyvips settings
        
        Args:
            content: Image file bytes
            filename: Original filename
            options: Conversion parameters
            
        Returns:
            tuple: (converted_bytes, new_filename)
            
        Raises:
            ValueError: If format not supported or conversion fails
        """
        # Check if format is supported
        if not format_checker.is_format_supported(options.format):
            unsupported = format_checker.get_unsupported_formats()
            error_detail = next(
                (item for item in unsupported if item["format"] == options.format),
                None
            )
            
            if error_detail:
                raise ValueError(
                    f"Format '{options.format}' is not supported on this system. "
                    f"Reason: {error_detail['error']}. "
                    f"Supported formats: {', '.join(format_checker.get_supported_output_formats())}"
                )
            else:
                raise ValueError(
                    f"Format '{options.format}' is not available. "
                    f"Supported formats: {', '.join(format_checker.get_supported_output_formats())}"
                )
        
        try:
            image = pyvips.Image.new_from_buffer(
                content, 
                "", 
                access="sequential"
            )
            
            # Log original image info
            logger.debug(f"Loaded image: {image.width}x{image.height}, bands={image.bands}, format={image.format}")
            
            # Resize if needed
            if options.width or options.height:
                image = ImageConverter._resize(image, options.width, options.height)
            
            # Convert and save
            buffer = ImageConverter._save(image, options)
            
            # Generate new filename
            base_name = filename.rsplit(".", 1)[0]
            new_name = f"{base_name}.{options.format}"
            
            return buffer, new_name
            
        except Exception as e:
            logger.error(f"Conversion failed for {filename}: {str(e)}")
            raise ValueError(f"Image conversion failed: {str(e)}")

    @staticmethod
    def _save(img: pyvips.Image, opt: ConversionRequest) -> bytes:
        """
        Save image with format-specific optimizations
        
        Args:
            img: pyvips Image object
            opt: Conversion options
            
        Returns:
            bytes: Converted image buffer
        """
        try:
            # Format-specific save handlers with optimal settings
            if opt.format == "webp":
                return img.webpsave_buffer(
                    Q=opt.quality,
                    strip=True,  # Remove metadata
                    effort=4,  # Balance between speed and compression (0-6)
                )
            
            elif opt.format == "avif":
                # Try AVIF first, fallback to HEIF if AV1 not supported
                try:
                    return img.heifsave_buffer(
                        Q=opt.quality,
                        compression="av1",
                        effort=4,
                        strip=True
                    )
                except Exception as e:
                    logger.warning(f"AVIF encoding failed, trying HEIF: {e}")
                    try:
                        # Fallback to HEIF (HEVC)
                        return img.heifsave_buffer(
                            Q=opt.quality,
                            compression="hevc",
                            strip=True
                        )
                    except Exception as e2:
                        raise ValueError(f"AVIF/HEIF encoding not supported. Install libheif with AV1 support.")
            
            elif opt.format == "jpeg":
                return img.jpegsave_buffer(
                    Q=opt.quality,
                    strip=True,
                    optimize_coding=True,  # Better compression
                    interlace=True  # Progressive JPEG
                )
            
            elif opt.format == "png":
                return img.pngsave_buffer(
                    compression=9,  # Max compression
                    strip=True,
                    interlace=False  # Faster encoding
                )
            
            elif opt.format == "tiff":
                return img.tiffsave_buffer(
                    compression="lzw",
                    Q=opt.quality,
                    strip=True
                )
            
            elif opt.format == "gif":
                # Convert to 8-bit if needed
                if img.bands == 3:
                    img = img.bandjoin(255)  # Add alpha channel
                return img.gifsave_buffer(strip=True)
            
            elif opt.format == "bmp":
                return img.magicksave_buffer(format="BMP")
            
            elif opt.format == "heif":
                return img.heifsave_buffer(
                    Q=opt.quality,
                    compression="hevc",
                    strip=True
                )
            
            elif opt.format == "ppm":
                return img.ppmsave_buffer(strip=True)
            
            else:
                raise ValueError(f"Unsupported format: {opt.format}")
                
        except Exception as e:
            logger.error(f"Save failed for format {opt.format}: {str(e)}")
            raise

    @staticmethod
    def _resize(img: pyvips.Image, width: int = None, height: int = None) -> pyvips.Image:
        """
        Resize image with proper aspect ratio handling
        
        Args:
            img: pyvips Image object
            width: Target width (optional)
            height: Target height (optional)
            
        Returns:
            pyvips.Image: Resized image
        """
        try:
            original_width = img.width
            original_height = img.height
            
            if width and height:
                # Force exact dimensions (may distort)
                return img.thumbnail_image(
                    width,
                    height=height,
                    size=pyvips.Size.FORCE,
                    no_rotate=True  # Don't auto-rotate
                )
            
            elif width:
                # Resize by width, maintain aspect ratio
                if width >= original_width:
                    return img  # Don't upscale
                return img.thumbnail_image(
                    width,
                    height=10000,  # Max height to maintain aspect
                    no_rotate=True
                )
            
            elif height:
                # Resize by height, maintain aspect ratio
                if height >= original_height:
                    return img  # Don't upscale
                    
                scale = height / original_height
                new_width = int(original_width * scale)
                
                return img.thumbnail_image(
                    new_width,
                    height=height,
                    no_rotate=True
                )
            
            return img
            
        except Exception as e:
            logger.error(f"Resize failed: {str(e)}")
            raise

# Global instance
converter = ImageConverter()