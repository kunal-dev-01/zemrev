#!/bin/bash

# Development Mode Script
# Usage: ./scripts/dev.sh [start|stop|restart|logs|rebuild|clean]

set -e

PROJECT_NAME="zemrev"
COMPOSE_FILE="docker-compose.dev.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Start development environment
dev_start() {
    print_info "Starting development environment..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Development environment started!"
    print_info "API: http://localhost:8000"
    print_info "Health: http://localhost:8000/health"
    print_info "Docs: http://localhost:8000/docs"
}

# Stop development environment
dev_stop() {
    print_info "Stopping development environment..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Development environment stopped!"
}

# Restart development environment
dev_restart() {
    print_info "Restarting development environment..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Development environment restarted!"
}

# View logs
dev_logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Rebuild containers
dev_rebuild() {
    print_info "Rebuilding containers..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Containers rebuilt!"
}

# Clean everything
dev_clean() {
    print_info "Cleaning Docker resources..."
    docker-compose -f $COMPOSE_FILE down -v
    docker system prune -f
    print_success "Cleanup complete!"
}

# Status check
dev_status() {
    print_info "Container status:"
    docker-compose -f $COMPOSE_FILE ps
}

# Shell access
dev_shell() {
    print_info "Opening shell in backend container..."
    docker exec -it img_api_dev bash
}

# Main command handler
case "${1:-start}" in
    start)
        dev_start
        ;;
    stop)
        dev_stop
        ;;
    restart)
        dev_restart
        ;;
    logs)
        dev_logs
        ;;
    rebuild)
        dev_rebuild
        ;;
    clean)
        dev_clean
        ;;
    status)
        dev_status
        ;;
    shell)
        dev_shell
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|shell}"
        exit 1
        ;;
esac