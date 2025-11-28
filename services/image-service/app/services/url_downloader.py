# ============================================================================
# FILE: app/services/url_downloader.py
# PURPOSE: Download images from URLs securely
# COMMIT: feat: add secure URL image downloader with validation
# ============================================================================

import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class URLDownloader:
    """Secure image downloader from URLs"""
    
    ALLOWED_TYPES = [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "image/bmp", "image/tiff", "image/avif", "image/heif"
    ]
    
    @staticmethod
    async def download(url: str) -> tuple[bytes, str]:
        """
        Download image from URL
        
        Args:
            url: Image URL
            
        Returns:
            tuple: (content_bytes, filename)
        """
        
        try:
            async with httpx.AsyncClient(
                timeout=settings.URL_TIMEOUT,
                follow_redirects=True,
                limits=httpx.Limits(max_connections=10)
            ) as client:
                
                # HEAD request to check size
                try:
                    head = await client.head(url)
                    content_length = head.headers.get("content-length")
                    
                    if content_length and int(content_length) > settings.MAX_URL_SIZE:
                        raise ValueError(
                            f"File too large: {int(content_length)} bytes"
                        )
                except:
                    pass
                
                # GET request
                response = await client.get(url)
                response.raise_for_status()
                
                # Validate content type
                content_type = response.headers.get("content-type", "").split(";")[0]
                
                if content_type not in URLDownloader.ALLOWED_TYPES:
                    raise ValueError(f"Invalid content type: {content_type}")
                
                # Validate size
                content = response.content
                
                if len(content) > settings.MAX_URL_SIZE:
                    raise ValueError(f"File too large: {len(content)} bytes")
                
                if len(content) == 0:
                    raise ValueError("Empty file")
                
                # Extract filename
                filename = URLDownloader._extract_filename(url)
                
                logger.info(f"Downloaded {len(content)} bytes from URL")
                
                return content, filename
                
        except httpx.HTTPStatusError as e:
            raise ValueError(f"HTTP {e.response.status_code}")
        except httpx.TimeoutException:
            raise ValueError("Download timeout")
        except httpx.RequestError as e:
            raise ValueError(f"Network error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Download failed: {str(e)}")
    
    @staticmethod
    def _extract_filename(url: str) -> str:
        """Extract filename from URL"""
        
        try:
            from urllib.parse import urlparse, unquote
            path = urlparse(url).path
            filename = unquote(path.split("/")[-1])
            
            if "." not in filename or len(filename) > 100:
                filename = "download.jpg"
            
            return filename
        except:
            return "download.jpg"

# Global instance
url_downloader = URLDownloader()