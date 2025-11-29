# ============================================================================
# FILE: services/image-service/Dockerfile
# PURPOSE: Production-optimized multi-stage build (PyVIPS + HEIC support)
# ============================================================================

# ============================================================================
# STAGE 1: BUILDER
# ============================================================================

FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    cmake \
    # PyVIPS with HEIC/HEIF support
    libvips-dev \
    libaom-dev \
    libheif-dev \
    libde265-dev \
    libx265-dev \
    libwebp-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libtiff-dev \
    libgif-dev \
    librsvg2-dev \
    libfreetype6-dev \
    libfribidi-dev \
    libharfbuzz-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================================================
# STAGE 2: RUNTIME (Minimal)
# ============================================================================

FROM python:3.11-slim

# Install ONLY runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core PyVIPS runtime
    libvips42 \
    libvips-tools \
    # AVIF support
    libaom3 \
    # HEIF/HEIC support (CRITICAL!)
    libheif1 \
    libde265-0 \
    libx265-199 \
    # WebP support
    libwebp7 \
    libwebpmux3 \
    libwebpdemux2 \
    # JPEG support
    libjpeg62-turbo \
    # PNG support
    libpng16-16 \
    # TIFF support
    libtiff5 \
    # GIF support
    libgif7 \
    # SVG support
    librsvg2-2 \
    # Font support
    libfreetype6 \
    libfribidi0 \
    libharfbuzz0b \
    liblcms2-2 \
    libopenjp2-7 \
    zlib1g \
    # Utilities
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# ============================================================================
# SECURITY: NON-ROOT USER
# ============================================================================

RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy application
COPY --chown=appuser:appuser . .

USER appuser

# ============================================================================
# EXPOSE & HEALTH
# ============================================================================

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ============================================================================
# START COMMAND
# ============================================================================

CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--log-level", "info"]