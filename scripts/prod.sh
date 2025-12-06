#!/bin/bash
# ============================================================================
# FILE: scripts/prod.sh
# PURPOSE: Production environment management (Single VM)
# ============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Start
prod_start() {
    print_info "Starting production environment..."
    
    # Check .env.production
    if [ ! -f services/image-service/.env.production ]; then
        print_error ".env.production not found!"
        print_info "Creating template..."
        cat > services/image-service/.env.production << 'EOF'
REDIS_URL=redis://redis-queue:6379
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
        print_error "⚠️  UPDATE ALLOWED_ORIGINS before deploying!"
        exit 1
    fi
    
    docker-compose -f $COMPOSE_FILE up -d --build
    print_success "Production started!"
    print_info "Gateway: http://localhost"
    print_info "Health: http://localhost/health"
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
        docker-compose -f $COMPOSE_FILE logs -f --tail=100
    else
        print_info "Showing logs for $SERVICE..."
        docker-compose -f $COMPOSE_FILE logs -f --tail=100 $SERVICE
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

# Status
prod_status() {
    print_info "Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        zemrev_redis_prod zemrev_gateway_prod zemrev_image_prod 2>/dev/null || \
        docker stats --no-stream
}

# Health
prod_health() {
    print_info "Checking health..."
    
    # Gateway
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        print_success "Gateway: healthy"
    else
        print_error "Gateway: unhealthy"
    fi
    
    # Image Service (via gateway)
    if curl -sf http://localhost/api/v1/image/health > /dev/null 2>&1; then
        print_success "Image Service: healthy"
    else
        print_error "Image Service: unhealthy (check via direct: http://localhost:8000/health)"
    fi
    
    # Redis
    if docker exec zemrev_redis_prod redis-cli ping > /dev/null 2>&1; then
        print_success "Redis: healthy"
    else
        print_error "Redis: unhealthy"
    fi
}

# Scale
prod_scale() {
    SERVICE="${2:-image-service}"
    REPLICAS="${3:-2}"
    
    print_info "Scaling $SERVICE to $REPLICAS instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale $SERVICE=$REPLICAS
    print_success "Scaled $SERVICE to $REPLICAS"
}

# Main
case "${1:-start}" in
    start) prod_start ;;
    stop) prod_stop ;;
    restart) prod_restart ;;
    logs) prod_logs "$@" ;;
    rebuild) prod_rebuild ;;
    status) prod_status ;;
    health) prod_health ;;
    scale) prod_scale "$@" ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|rebuild|status|health|scale}"
        echo ""
        echo "Examples:"
        echo "  $0 start          # Start production"
        echo "  $0 logs           # All logs"
        echo "  $0 logs image-service  # Specific service"
        echo "  $0 scale image-service 4  # Scale to 4 instances"
        exit 1
        ;;
esac