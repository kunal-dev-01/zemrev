# ============================================================================
# FILE: services/api-gateway/Dockerfile
# PURPOSE: Nginx API Gateway
# ============================================================================

FROM nginx:1.25-alpine

# Copy config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]