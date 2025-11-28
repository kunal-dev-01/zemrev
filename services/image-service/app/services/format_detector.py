# ============================================================================
# FILE: app/services/format_detector.py
# PURPOSE: Detect format support for PyVips and Pillow
# COMMIT: feat: add intelligent format detection for both engines
# ============================================================================

import pyvips
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FormatDetector:
    """Detect and manage format support across engines"""
    
    _pyvips_formats = None
    _pillow_formats = None
    _combined_info = None
    
    # ========================================================================
    # FORMAT DEFINITIONS
    # ========================================================================
    
    # PyVips最佳格式（快速，低内存）
    PYVIPS_BEST = ["webp", "jpeg", "jpg", "png", "tiff", "avif"]
    
    # Pillow最佳格式
    PILLOW_BEST = ["bmp", "gif", "ico", "ppm"]
    
    # 两者都支持的格式
    SHARED_FORMATS = ["png", "jpeg", "jpg", "tiff", "tif", "webp"]
    
    # ========================================================================
    # DETECTION METHODS
    # ========================================================================
    
    @classmethod
    def detect_all(cls) -> dict:
        """检测所有格式支持"""
        if cls._combined_info:
            return cls._combined_info
        
        logger.info("🔍 Detecting format support...")
        
        pyvips_formats = cls._detect_pyvips()
        pillow_formats = cls._detect_pillow()
        
        # 合并信息
        all_formats = set(pyvips_formats + pillow_formats)
        
        cls._combined_info = {
            "pyvips": pyvips_formats,
            "pillow": pillow_formats,
            "combined": sorted(list(all_formats)),
            "total": len(all_formats),
            "pyvips_only": [f for f in pyvips_formats if f not in pillow_formats],
            "pillow_only": [f for f in pillow_formats if f not in pyvips_formats],
            "shared": [f for f in pyvips_formats if f in pillow_formats]
        }
        
        logger.info(f"✅ Total formats: {cls._combined_info['total']}")
        logger.info(f"   PyVips: {len(pyvips_formats)}")
        logger.info(f"   Pillow: {len(pillow_formats)}")
        
        return cls._combined_info
    
    @classmethod
    def _detect_pyvips(cls) -> list[str]:
        """检测PyVips支持的格式"""
        if cls._pyvips_formats:
            return cls._pyvips_formats
        
        supported = []
        test_img = pyvips.Image.black(10, 10).copy(interpretation="srgb")
        
        formats_to_test = {
            "webp": lambda: test_img.webpsave_buffer(Q=80),
            "jpeg": lambda: test_img.jpegsave_buffer(Q=80),
            "png": lambda: test_img.pngsave_buffer(),
            "tiff": lambda: test_img.tiffsave_buffer(),
            "avif": lambda: test_img.heifsave_buffer(Q=80, compression="av1"),
        }
        
        for fmt, test_fn in formats_to_test.items():
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
        """检测Pillow支持的格式"""
        if cls._pillow_formats:
            return cls._pillow_formats
        
        # Pillow.Image.SAVE包含所有可保存的格式
        supported = []
        
        # 常见格式
        common = ["jpeg", "jpg", "png", "webp", "bmp", "gif", "tiff", "ico", "ppm"]
        
        for fmt in common:
            if fmt.upper() in Image.SAVE or fmt.lower() in Image.SAVE:
                supported.append(fmt)
        
        cls._pillow_formats = supported
        return supported
    
    # ========================================================================
    # QUERY METHODS
    # ========================================================================
    
    @classmethod
    def is_pyvips_supported(cls, format: str) -> bool:
        """检查PyVips是否支持该格式"""
        if not cls._pyvips_formats:
            cls.detect_all()
        return format.lower() in cls._pyvips_formats
    
    @classmethod
    def is_pillow_supported(cls, format: str) -> bool:
        """检查Pillow是否支持该格式"""
        if not cls._pillow_formats:
            cls.detect_all()
        return format.lower() in cls._pillow_formats
    
    @classmethod
    def is_supported(cls, format: str) -> bool:
        """检查任一引擎是否支持"""
        return cls.is_pyvips_supported(format) or cls.is_pillow_supported(format)
    
    @classmethod
    def get_best_engine(cls, format: str) -> str:
        """获取最佳引擎"""
        fmt_lower = format.lower()
        
        # PyVips最佳格式
        if fmt_lower in cls.PYVIPS_BEST and cls.is_pyvips_supported(fmt_lower):
            return "pyvips"
        
        # Pillow最佳格式
        if fmt_lower in cls.PILLOW_BEST and cls.is_pillow_supported(fmt_lower):
            return "pillow"
        
        # 共享格式，优先PyVips
        if cls.is_pyvips_supported(fmt_lower):
            return "pyvips"
        
        if cls.is_pillow_supported(fmt_lower):
            return "pillow"
        
        return None
    
    @classmethod
    def get_all_formats(cls) -> list[str]:
        """获取所有支持的格式"""
        if not cls._combined_info:
            cls.detect_all()
        return cls._combined_info["combined"]

# ============================================================================
# GLOBAL INSTANCE
# ============================================================================
format_detector = FormatDetector()