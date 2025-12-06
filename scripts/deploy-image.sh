#!/bin/bash
# ============================================================================
# FILE: scripts/deploy-image.sh
# PURPOSE: Deploy Image Service (can be deployed multiple times for scaling)
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

print_info "Deploying Image Service..."

# Check if .env.production exists
if [ ! -f services/image-service/.env.production ]; then
    print_error ".env.production not found!"
    print_info "Creating template..."
    
    cat > services/image-service/.env.production << 'EOF'
REDIS_URL=redis://REDIS_VM_IP:6379
REDIS_MAX_CONNECTIONS=50
REDIS_SOCKET_TIMEOUT=5

QUEUE_NAME=zemrev_image_jobs
QUEUE_MAX_WORKERS=4
QUEUE_MAX_RETRIES=3
QUEUE_JOB_TIMEOUT=600
QUEUE_RESULT_TTL=300

MAX_FILE_SIZE=52428800
MAX_DIMENSION=15000
MAX_URL_SIZE=52428800
URL_TIMEOUT=30

WORKERS=4
LOG_LEVEL=info
HOST=0.0.0.0
PORT=8000

ALLOWED_ORIGINS=*

VIPS_CONCURRENCY=4
VIPS_DISC_THRESHOLD=100m
EOF
    
    print_success "Created .env.production"
    print_error "⚠️  UPDATE REDIS_URL in .env.production with your Redis VM IP!"
    exit 1
fi

cd services/image-service

# Ensure network exists
docker network create zemrev_network 2>/dev/null || true

# Deploy Image Service
docker-compose -f docker-compose.image.yml up -d --build

print_success "Image Service deployed on port 8000"
print_info "Health: http://localhost:8000/health"

# Show status
docker ps --filter name=zemrev_image

print_success "Image Service ready!"