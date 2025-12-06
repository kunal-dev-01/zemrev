#!/bin/bash
# ============================================================================
# FILE: scripts/deploy-gateway.sh
# PURPOSE: Deploy API Gateway (once per infrastructure)
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

print_info "Deploying API Gateway..."

cd services/api-gateway

# Ensure network exists
docker network create zemrev_network 2>/dev/null || true

# Deploy Gateway
docker-compose -f docker-compose.gateway.yml up -d --build

print_success "API Gateway deployed on port 80"
print_info "Routes:"
print_info "  - /api/v1/image/* → Image Service"
print_info "  - /api/v1/pdf/*   → PDF Service (future)"

# Show status
docker ps --filter name=zemrev_gateway

print_success "Gateway ready!"