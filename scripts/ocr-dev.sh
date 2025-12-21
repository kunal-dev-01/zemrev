#!/bin/bash
# ============================================================================
# FILE: scripts/ocr-dev.sh
# PURPOSE: OCR Service development environment management (Separate VM)
# ============================================================================

set -e

COMPOSE_FILE="docker-compose.ocr.dev.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Start
ocr_dev_start() {
    print_info "Starting OCR service (development)..."
    
    # Check .env file
    if [ ! -f services/ocr-service/.env ]; then
        print_error ".env not found!"
        print_info "Creating .env file..."
        cat > services/ocr-service/.env << 'EOF'
REDIS_URL=redis://MAIN_SERVER_IP:6379
REDIS_MAX_CONNECTIONS=20
REDIS_SOCKET_TIMEOUT=5
QUEUE_NAME=zemrev_ocr_jobs_dev
QUEUE_MAX_RETRIES=3
QUEUE_JOB_TIMEOUT=1800
QUEUE_RESULT_TTL=1200

WORKERS=1
LOG_LEVEL=debug
HOST=0.0.0.0
PORT=8004
ALLOWED_ORIGINS=*
UPLOAD_DIR=/tmp/zemrev_ocr_uploads
QUEUE_MAX_WORKERS=1

MAX_FILE_SIZE=26214400
MAX_PAGES=50
TOOL_TIMEOUT=600
EOF
        print_success "Created .env file"
        print_error "⚠️  UPDATE REDIS_URL with Main Server IP before running!"
        exit 1
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "OCR development started!"
    print_info "Service: http://localhost:8004"
    print_info "Health: http://localhost:8004/health"
    print_info "Docs: http://localhost:8004/docs"
}

# Stop
ocr_dev_stop() {
    print_info "Stopping OCR service..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Stopped!"
}

# Restart
ocr_dev_restart() {
    print_info "Restarting OCR service..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Restarted!"
}

# Logs
ocr_dev_logs() {
    print_info "Showing OCR service logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f --tail=100
}

# Rebuild
ocr_dev_rebuild() {
    print_info "Rebuilding OCR service..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Rebuilt!"
}

# Clean
ocr_dev_clean() {
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
ocr_dev_status() {
    print_info "OCR Service Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" zemrev_ocr_dev 2>/dev/null || docker stats --no-stream
}

# Health check
ocr_dev_health() {
    print_info "Checking OCR service health..."
    
    if curl -sf http://localhost:8004/health > /dev/null 2>&1; then
        print_success "OCR Service: healthy"
        
        # Show queue status
        HEALTH=$(curl -s http://localhost:8004/health)
        echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    else
        print_error "OCR Service: unhealthy"
    fi
}

# Shell
ocr_dev_shell() {
    print_info "Opening shell in OCR service..."
    docker-compose -f $COMPOSE_FILE exec ocr-service bash
}

# Main
case "${1:-start}" in
    start) ocr_dev_start ;;
    stop) ocr_dev_stop ;;
    restart) ocr_dev_restart ;;
    logs) ocr_dev_logs ;;
    rebuild) ocr_dev_rebuild ;;
    clean) ocr_dev_clean ;;
    status) ocr_dev_status ;;
    health) ocr_dev_health ;;
    shell) ocr_dev_shell ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|health|shell}"
        echo ""
        echo "Examples:"
        echo "  $0 start              # Start OCR service"
        echo "  $0 logs               # Show logs"
        echo "  $0 restart            # Restart service"
        echo "  $0 health             # Health check"
        echo "  $0 status             # Container status"
        echo "  $0 shell              # Open shell"
        echo "  $0 rebuild            # Rebuild from scratch"
        echo "  $0 clean              # Clean containers & volumes"
        exit 1
        ;;
esac