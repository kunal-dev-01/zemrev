#!/bin/bash
# ============================================================================
# FILE: scripts/dev.sh
# PURPOSE: Development environment management
# ============================================================================

set -e

COMPOSE_FILE="docker-compose.all.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Start
dev_start() {
    print_info "Starting development environment..."
    
    # Create .env if missing
    if [ ! -f services/image-service/.env ]; then
        print_info "Creating .env file..."
        cat > services/image-service/.env << 'EOF'
REDIS_URL=redis://redis-queue:6379
QUEUE_NAME=zemrev_image_jobs
QUEUE_MAX_WORKERS=2
QUEUE_MAX_RETRIES=3
QUEUE_JOB_TIMEOUT=600
QUEUE_RESULT_TTL=300

MAX_FILE_SIZE=52428800
MAX_DIMENSION=15000
MAX_URL_SIZE=52428800
URL_TIMEOUT=30

WORKERS=1
LOG_LEVEL=debug
HOST=0.0.0.0
PORT=8000

ALLOWED_ORIGINS=*

VIPS_CONCURRENCY=2
VIPS_DISC_THRESHOLD=50m
EOF
        print_success "Created .env file"
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "Development started!"
    print_info "Gateway: http://localhost"
    print_info "Image Service: http://localhost:8000"
    print_info "Docs: http://localhost:8000/docs"
}

# Stop
dev_stop() {
    print_info "Stopping..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Stopped!"
}

# Restart
dev_restart() {
    print_info "Restarting..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Restarted!"
}

# Logs
dev_logs() {
    SERVICE="${2:-}"
    if [ -z "$SERVICE" ]; then
        print_info "Showing all logs (Ctrl+C to exit)..."
        docker-compose -f $COMPOSE_FILE logs -f
    else
        print_info "Showing logs for $SERVICE..."
        docker-compose -f $COMPOSE_FILE logs -f $SERVICE
    fi
}

# Rebuild
dev_rebuild() {
    print_info "Rebuilding..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Rebuilt!"
}

# Clean
dev_clean() {
    read -p "Remove all containers and volumes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning..."
        docker-compose -f $COMPOSE_FILE down -v
        docker system prune -f
        print_success "Cleaned!"
    fi
}

# Status
dev_status() {
    print_info "Status:"
    docker-compose -f $COMPOSE_FILE ps
}

# Shell
dev_shell() {
    SERVICE="${2:-image-service}"
    print_info "Opening shell in $SERVICE..."
    docker-compose -f $COMPOSE_FILE exec $SERVICE bash
}

# Test
dev_test() {
    print_info "Testing Image Service..."
    
    # Create test image
    convert -size 100x100 xc:red /tmp/test.jpg 2>/dev/null || {
        print_error "ImageMagick not installed, creating dummy file"
        echo "test" > /tmp/test.jpg
    }
    
    # Test convert
    curl -X POST http://localhost/api/v1/image/convert \
        -F "file=@/tmp/test.jpg" \
        -F "format=webp" \
        -F "quality=80" \
        -o /tmp/test.webp
    
    if [ -f /tmp/test.webp ]; then
        print_success "Convert test passed!"
    else
        print_error "Convert test failed!"
    fi
}

# Main
case "${1:-start}" in
    start) dev_start ;;
    stop) dev_stop ;;
    restart) dev_restart ;;
    logs) dev_logs "$@" ;;
    rebuild) dev_rebuild ;;
    clean) dev_clean ;;
    status) dev_status ;;
    shell) dev_shell "$@" ;;
    test) dev_test ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|shell|test}"
        exit 1
        ;;
esac