#!/bin/bash
# ============================================================================
# FILE: scripts/dev.sh
# PURPOSE: Development environment management
# USAGE: ./scripts/dev.sh [start|stop|restart|logs|rebuild|clean]
# ============================================================================

set -e

COMPOSE_FILE="docker-compose.dev.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Start
dev_start() {
    print_info "Starting development environment..."
    
    if [ ! -f services/image-service/.env ]; then
        print_error ".env not found!"
        print_info "Creating from template..."
        cat > services/image-service/.env << 'EOF'
REDIS_URL=redis://redis:6379
REDIS_MAX_CONNECTIONS=20
QUEUE_NAME=zemrev_jobs_dev
QUEUE_MAX_WORKERS=2
MAX_FILE_SIZE=52428800
LOG_LEVEL=debug
ALLOWED_ORIGINS=*
VIPS_CONCURRENCY=2
EOF
        print_success "Created .env file"
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "Development started!"
    print_info "API: http://localhost:8000"
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
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
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
    print_info "Opening shell..."
    docker exec -it zemrev_api_dev bash
}

# Main
case "${1:-start}" in
    start) dev_start ;;
    stop) dev_stop ;;
    restart) dev_restart ;;
    logs) dev_logs ;;
    rebuild) dev_rebuild ;;
    clean) dev_clean ;;
    status) dev_status ;;
    shell) dev_shell ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|shell}"
        exit 1
        ;;
esac