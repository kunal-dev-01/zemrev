# ============================================================================
# FILE: services/api-gateway/Dockerfile
# PURPOSE: Nginx API Gateway (Production)
# ============================================================================

FROM nginx:1.25-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Non-root user (security)
RUN adduser -D -g 'nginx' nginxuser \
 && chown -R nginxuser:nginxuser /var/cache/nginx /var/run /etc/nginx

USER nginxuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
