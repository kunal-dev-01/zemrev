#!/bin/bash
# ============================================================================
# FILE: scripts/deploy-queue.sh
# PURPOSE: Deploy shared Redis queue (once per infrastructure)
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

print_info "Deploying Shared Redis Queue..."

cd services/redis-queue

# Create network if not exists
docker network create zemrev_network 2>/dev/null || true

# Deploy Redis
docker-compose -f docker-compose.queue.yml up -d

print_success "Redis Queue deployed on port 6379"
print_info "Connect string: redis://$(hostname -I | awk '{print $1}'):6379"

# Show status
docker ps --filter name=zemrev_redis_queue

print_success "Queue service ready!"