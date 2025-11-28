# ============================================================================
# FILE: services/image-service/Dockerfile
# PURPOSE: Production-optimized multi-stage build
# COMMIT: feat: add production Dockerfile with security hardening
# ============================================================================

# ============================================================================
# STAGE 1: BUILDER
# ============================================================================

FROM python:3.11-slim AS builder

# Install build dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    cmake \
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

# Install Python packages to user directory
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================================================
# STAGE 2: RUNTIME (Minimal)
# ============================================================================

FROM python:3.11-slim

# Install ONLY runtime libraries (no -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core libraries (runtime only)
    libvips42 \
    libvips-tools \
    # AVIF support
    libaom3 \
    # HEIF support
    libheif1 \
    libde265-0 \
    libx265-199 \
    # Image formats
    libwebp7 \
    libwebpmux3 \
    libwebpdemux2 \
    libjpeg62-turbo \
    libpng16-16 \
    libtiff5 \
    libgif7 \
    librsvg2-2 \
    # Pillow runtime deps
    libfreetype6 \
    libfribidi0 \
    libharfbuzz0b \
    liblcms2-2 \
    libopenjp2-7 \
    zlib1g \
    # Utilities
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# COPY PYTHON PACKAGES FROM BUILDER
# ============================================================================

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# ============================================================================
# SECURITY: CREATE NON-ROOT USER
# ============================================================================

RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# ============================================================================
# EXPOSE PORT
# ============================================================================

EXPOSE 8000

# ============================================================================
# HEALTH CHECK
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ============================================================================
# PRODUCTION COMMAND (4 workers, optimized)
# ============================================================================

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--log-level", "info"]