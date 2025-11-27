FROM python:3.11-slim

# Install ALL libvips dependencies for maximum format support
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core libvips
    libvips-dev \
    libvips-tools \
    # HEIC/HEIF support
    libheif-dev \
    # SVG support
    librsvg2-dev \
    # GIF support
    libgif-dev \
    # Additional formats
    libtiff-dev \
    libwebp-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    # ImageMagick for BMP
    libmagickwand-dev \
    # Build tools
    gcc \
    g++ \
    make \
    # Utilities
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--log-level", "info"]