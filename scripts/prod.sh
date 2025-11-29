#!/bin/bash
# ============================================================================
# FILE: scripts/prod.sh
# PURPOSE: Production environment management
# USAGE: ./scripts/prod.sh [start|stop|restart|logs|rebuild|clean|health]
# ============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Start
prod_start() {
    print_info "Starting production environment..."
    
    if [ ! -f services/image-service/.env.production ]; then
        print_error ".env.production not found!"
        print_info "Creating from template..."
        cat > services/image-service/.env.production << 'EOF'
REDIS_URL=redis://redis:6379
REDIS_MAX_CONNECTIONS=50
QUEUE_NAME=zemrev_jobs
QUEUE_MAX_WORKERS=4
MAX_FILE_SIZE=52428800
LOG_LEVEL=info
ALLOWED_ORIGINS=*
VIPS_CONCURRENCY=4
EOF
        print_success "Created .env.production"
        print_info "⚠️  CHANGE ALLOWED_ORIGINS to your domain!"
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "Production started!"
    print_info "API: http://localhost:8000"
    print_info "Health: http://localhost:8000/health"
}

# Stop
prod_stop() {
    print_info "Stopping..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Stopped!"
}

# Restart
prod_restart() {
    print_info "Restarting..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Restarted!"
}

# Logs
prod_logs() {
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
prod_rebuild() {
    print_info "Rebuilding..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Rebuilt!"
}

# Clean
prod_clean() {
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
prod_status() {
    print_info "Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream
}

# Health check
prod_health() {
    print_info "Checking health..."
    
    if curl -sf http://localhost:8000/health > /dev/null; then
        print_success "Service is healthy!"
        curl http://localhost:8000/health 2>/dev/null | python3 -m json.tool
    else
        print_error "Service is unhealthy!"
        exit 1
    fi
}

# Backup Redis
prod_backup() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    print_info "Creating backup..."
    docker exec zemrev_redis_prod redis-cli SAVE
    docker cp zemrev_redis_prod:/data/dump.rdb $BACKUP_DIR/
    
    print_success "Backup saved to $BACKUP_DIR"
}

# Main
case "${1:-start}" in
    start) prod_start ;;
    stop) prod_stop ;;
    restart) prod_restart ;;
    logs) prod_logs "$@" ;;
    rebuild) prod_rebuild ;;
    clean) prod_clean ;;
    status) prod_status ;;
    health) prod_health ;;
    backup) prod_backup ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|clean|status|health|backup}"
        exit 1
        ;;
esac