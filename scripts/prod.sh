#!/bin/bash

# Production Mode Script
# Usage: ./scripts/prod.sh [start|stop|restart|logs|rebuild|clean|scale]

set -e

COMPOSE_FILE="docker-compose.prod.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Start production environment
prod_start() {
    print_info "Starting production environment..."
    
    # Check if .env exists
    if [ ! -f services/image-service/.env ]; then
        print_error ".env file not found!"
        print_info "Creating from .env.example..."
        cp services/image-service/.env.example services/image-service/.env
        print_info "Please edit services/image-service/.env before starting"
        exit 1
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "Production environment started!"
    print_info "API: http://localhost:8000"
    print_info "Health: http://localhost:8000/health"
}

# Stop production environment
prod_stop() {
    print_info "Stopping production environment..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Production environment stopped!"
}

# Restart production environment
prod_restart() {
    print_info "Restarting production environment..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Production environment restarted!"
}

# View logs
prod_logs() {
    SERVICE="${2:-}"
    if [ -z "$SERVICE" ]; then
        print_info "Showing all logs (Ctrl+C to exit)..."
        docker-compose -f $COMPOSE_FILE logs -f
    else
        print_info "Showing logs for $SERVICE (Ctrl+C to exit)..."
        docker-compose -f $COMPOSE_FILE logs -f $SERVICE
    fi
}

# Rebuild containers
prod_rebuild() {
    print_info "Rebuilding production containers..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Production containers rebuilt!"
}

# Clean everything
prod_clean() {
    read -p "This will remove all containers and volumes. Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning production resources..."
        docker-compose -f $COMPOSE_FILE down -v
        docker system prune -f
        print_success "Cleanup complete!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Status check
prod_status() {
    print_info "Production container status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream
}

# Scale backend
prod_scale() {
    REPLICAS="${2:-4}"
    print_info "Scaling backend to $REPLICAS instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale image-service=$REPLICAS
    print_success "Scaled to $REPLICAS instances!"
}

# Health check
prod_health() {
    print_info "Checking service health..."
    
    if curl -sf http://localhost:8000/health > /dev/null; then
        print_success "Service is healthy!"
        curl http://localhost:8000/health | json_pp
    else
        print_error "Service is unhealthy!"
        exit 1
    fi
}

# Backup (Redis data)
prod_backup() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    print_info "Creating backup..."
    docker exec img_redis redis-cli SAVE
    docker cp img_redis:/data/dump.rdb $BACKUP_DIR/
    
    print_success "Backup saved to $BACKUP_DIR"
}

# Main command handler
case "${1:-start}" in
    start)
        prod_start
        ;;
    stop)
        prod_stop
        ;;
    restart)
        prod_restart
        ;;
    logs)
        prod_logs "$@"
        ;;
    rebuild)
        prod_rebuild
        ;;
    clean)
        prod_clean
        ;;
    status)
        prod_status
        ;;
    scale)
        prod_scale "$@"
        ;;
    health)
        prod_health
        ;;
    backup)
        prod_backup
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|scale|health|backup}"
        exit 1
        ;;
esac