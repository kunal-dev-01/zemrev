import pyvips
import logging

logger = logging.getLogger(__name__)

class FormatChecker:
    """Check which formats are actually supported by libvips"""
    
    _supported_formats = None
    _format_info = None
    
    @classmethod
    def check_all_formats(cls) -> dict:
        """
        Check all format support on startup
        
        Returns:
            dict: Complete format information
        """
        if cls._format_info is not None:
            return cls._format_info
            
        logger.info("🔍 Checking libvips format support...")
        
        # Create test image
        test_img = pyvips.Image.black(10, 10).copy(interpretation="srgb")
        test_img = test_img.bandjoin([255, 255, 255])  # Add RGB channels
        
        # Output formats to test
        format_tests = {
            "webp": {
                "test": lambda: test_img.webpsave_buffer(Q=80, strip=True),
                "mime": "image/webp",
                "priority": "high"
            },
            "avif": {
                "test": lambda: test_img.heifsave_buffer(Q=80, compression="av1", strip=True),
                "mime": "image/avif",
                "priority": "high"
            },
            "jpeg": {
                "test": lambda: test_img.jpegsave_buffer(Q=80, strip=True),
                "mime": "image/jpeg",
                "priority": "high"
            },
            "png": {
                "test": lambda: test_img.pngsave_buffer(compression=9, strip=True),
                "mime": "image/png",
                "priority": "high"
            },
            "heif": {
                "test": lambda: test_img.heifsave_buffer(Q=80, compression="hevc", strip=True),
                "mime": "image/heif",
                "priority": "medium"
            },
            "tiff": {
                "test": lambda: test_img.tiffsave_buffer(compression="lzw"),
                "mime": "image/tiff",
                "priority": "medium"
            },
            "gif": {
                "test": lambda: test_img.gifsave_buffer(),
                "mime": "image/gif",
                "priority": "low"
            },
            "bmp": {
                "test": lambda: test_img.magicksave_buffer(format="BMP"),
                "mime": "image/bmp",
                "priority": "low"
            },
            "ppm": {
                "test": lambda: test_img.ppmsave_buffer(),
                "mime": "image/x-portable-pixmap",
                "priority": "low"
            }
        }
        
        supported_output = []
        unsupported_output = []
        
        # Test each format
        for format_name, info in format_tests.items():
            try:
                info["test"]()
                supported_output.append(format_name)
                logger.info(f"✅ {format_name.upper()}: Supported")
            except Exception as e:
                unsupported_output.append({
                    "format": format_name,
                    "error": str(e)
                })
                logger.warning(f"❌ {format_name.upper()}: Not supported - {str(e)[:50]}")
        
        # Input formats (from libvips loaders)
        supported_input = []
        try:
            # Get all available loaders
            for suffix in pyvips.get_suffixes():
                supported_input.append(suffix)
        except:
            # Fallback to common formats
            supported_input = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".gif", ".bmp"]
        
        cls._format_info = {
            "output": {
                "supported": supported_output,
                "unsupported": unsupported_output
            },
            "input": {
                "suffixes": supported_input
            },
            "libvips_version": pyvips.version(0)
        }
        
        logger.info(f"✅ Format check complete. Supported outputs: {', '.join(supported_output)}")
        
        return cls._format_info
    
    @classmethod
    def get_supported_output_formats(cls) -> list:
        """Get list of supported output formats"""
        if cls._format_info is None:
            cls.check_all_formats()
        return cls._format_info["output"]["supported"]
    
    @classmethod
    def get_unsupported_formats(cls) -> list:
        """Get list of unsupported formats with reasons"""
        if cls._format_info is None:
            cls.check_all_formats()
        return cls._format_info["output"]["unsupported"]
    
    @classmethod
    def is_format_supported(cls, format_name: str) -> bool:
        """Check if a specific format is supported"""
        if cls._format_info is None:
            cls.check_all_formats()
        return format_name.lower() in cls._format_info["output"]["supported"]

# Global instance
format_checker = FormatChecker()