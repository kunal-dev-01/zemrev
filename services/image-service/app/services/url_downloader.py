# ============================================================================
# FILE: app/services/url_downloader.py
# PURPOSE: Download images from URLs with validation
# COMMIT: feat: add secure URL image downloader with size limits
# ============================================================================

import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class URLDownloader:
    """Download images from URLs securely"""
    
    ALLOWED_CONTENT_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/avif",
        "image/heif",
        "image/heic"
    ]
    
    @staticmethod
    async def download(url: str) -> tuple[bytes, str]:
        """
        Download image from URL
        
        Args:
            url: Image URL
            
        Returns:
            tuple: (content_bytes, content_type)
            
        Raises:
            ValueError: If download fails or invalid image
        """
        try:
            async with httpx.AsyncClient(
                timeout=settings.URL_TIMEOUT,
                follow_redirects=True,
                limits=httpx.Limits(max_connections=10)
            ) as client:
                
                # HEAD request to check size first
                try:
                    head_response = await client.head(url)
                    content_length = head_response.headers.get("content-length")
                    
                    if content_length and int(content_length) > settings.MAX_URL_SIZE:
                        raise ValueError(
                            f"File too large: {int(content_length)} bytes "
                            f"(max: {settings.MAX_URL_SIZE})"
                        )
                except:
                    # HEAD might fail, proceed with GET
                    pass
                
                # GET request to download
                response = await client.get(url)
                response.raise_for_status()
                
                # Check content type
                content_type = response.headers.get("content-type", "").split(";")[0]
                
                if content_type not in URLDownloader.ALLOWED_CONTENT_TYPES:
                    raise ValueError(
                        f"Invalid content type: {content_type}. "
                        f"Expected image format."
                    )
                
                # Check size
                content = response.content
                if len(content) > settings.MAX_URL_SIZE:
                    raise ValueError(
                        f"Downloaded file too large: {len(content)} bytes"
                    )
                
                if len(content) == 0:
                    raise ValueError("Downloaded file is empty")
                
                logger.info(
                    f"Downloaded {len(content)} bytes from {url[:50]}... "
                    f"(type: {content_type})"
                )
                
                return content, content_type
                
        except httpx.HTTPStatusError as e:
            raise ValueError(f"HTTP error {e.response.status_code}: {str(e)}")
        except httpx.TimeoutException:
            raise ValueError(f"Download timeout after {settings.URL_TIMEOUT}s")
        except httpx.RequestError as e:
            raise ValueError(f"Network error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Download failed: {str(e)}")
    
    @staticmethod
    def extract_filename_from_url(url: str, default_ext: str = "jpg") -> str:
        """Extract filename from URL"""
        try:
            from urllib.parse import urlparse, unquote
            path = urlparse(url).path
            filename = unquote(path.split("/")[-1])
            
            # 如果没有扩展名，添加默认扩展名
            if "." not in filename or len(filename) > 100:
                filename = f"downloaded.{default_ext}"
            
            return filename
        except:
            return f"downloaded.{default_ext}"

# ============================================================================
# GLOBAL INSTANCE
# ============================================================================
url_downloader = URLDownloader()