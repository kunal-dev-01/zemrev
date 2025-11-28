# ============================================================================
# FILE: app/services/format_detector.py
# PURPOSE: Detect PyVips and Pillow format support
# COMMIT: feat: add intelligent format detection for both engines
# ============================================================================

import pyvips
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FormatDetector:
    """Detect format support across engines"""
    
    _pyvips_formats = None
    _pillow_formats = None
    _info = None
    
    # Best formats for each engine
    PYVIPS_BEST = ["webp", "jpeg", "jpg", "png", "tiff", "avif"]
    PILLOW_BEST = ["bmp", "gif", "ico", "ppm"]
    
    @classmethod
    def detect_all(cls) -> dict:
        """Detect all supported formats"""
        
        if cls._info:
            return cls._info
        
        logger.info("🔍 Detecting formats...")
        
        pyvips_fmts = cls._detect_pyvips()
        pillow_fmts = cls._detect_pillow()
        
        all_fmts = sorted(set(pyvips_fmts + pillow_fmts))
        
        cls._info = {
            "pyvips": pyvips_fmts,
            "pillow": pillow_fmts,
            "all": all_fmts,
            "total": len(all_fmts)
        }
        
        logger.info(f"✅ Total formats: {len(all_fmts)}")
        logger.info(f"   PyVips: {len(pyvips_fmts)}")
        logger.info(f"   Pillow: {len(pillow_fmts)}")
        
        return cls._info
    
    @classmethod
    def _detect_pyvips(cls) -> list[str]:
        """Detect PyVips formats"""
        
        if cls._pyvips_formats:
            return cls._pyvips_formats
        
        supported = []
        test_img = pyvips.Image.black(10, 10).copy(interpretation="srgb")
        
        tests = {
            "webp": lambda: test_img.webpsave_buffer(Q=80),
            "jpeg": lambda: test_img.jpegsave_buffer(Q=80),
            "png": lambda: test_img.pngsave_buffer(),
            "tiff": lambda: test_img.tiffsave_buffer(),
            "avif": lambda: test_img.heifsave_buffer(Q=80, compression="av1"),
            "ppm": lambda: test_img.ppmsave_buffer(),
        }
        
        for fmt, test_fn in tests.items():
            try:
                test_fn()
                supported.append(fmt)
                if fmt == "jpeg":
                    supported.append("jpg")
            except:
                pass
        
        cls._pyvips_formats = supported
        return supported
    
    @classmethod
    def _detect_pillow(cls) -> list[str]:
        """Detect Pillow formats"""
        
        if cls._pillow_formats:
            return cls._pillow_formats
        
        # Test actual save capability
        supported = []
        test_img = Image.new('RGB', (10, 10), color='red')
        
        formats_to_test = [
            "jpeg", "jpg", "png", "webp", "bmp", 
            "gif", "tiff", "tif", "ico", "ppm"
        ]
        
        for fmt in formats_to_test:
            try:
                buffer = io.BytesIO()
                save_fmt = fmt.upper()
                
                # Special handling for JPEG with RGBA
                if save_fmt in ["JPEG", "JPG"]:
                    test_img.convert("RGB").save(buffer, format="JPEG")
                else:
                    test_img.save(buffer, format=save_fmt)
                
                supported.append(fmt)
                logger.info(f"✅ Pillow: {fmt}")
            except Exception as e:
                logger.warning(f"❌ Pillow: {fmt} - {str(e)[:50]}")
        
        cls._pillow_formats = supported
        return supported
    
    @classmethod
    def get_best_engine(cls, format: str) -> str:
        """Get best engine for format"""
        
        if not cls._info:
            cls.detect_all()
        
        fmt = format.lower()
        
        # PyVips best formats
        if fmt in cls.PYVIPS_BEST and fmt in cls._pyvips_formats:
            return "pyvips"
        
        # Pillow best formats
        if fmt in cls.PILLOW_BEST and fmt in cls._pillow_formats:
            return "pillow"
        
        # Fallback priority
        if fmt in cls._pyvips_formats:
            return "pyvips"
        
        if fmt in cls._pillow_formats:
            return "pillow"
        
        return None
    
    @classmethod
    def is_supported(cls, format: str) -> bool:
        """Check if format supported"""
        
        if not cls._info:
            cls.detect_all()
        
        return format.lower() in cls._info["all"]

# Global instance
format_detector = FormatDetector()