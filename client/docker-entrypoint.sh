#!/bin/sh
set -e

echo "🚀 Starting SimplyDone Frontend with Runtime Configuration"

# Get backend URL from environment variable (ALB DNS)
BACKEND_URL=${BACKEND_ALB_DNS:-${BACKEND_URL:-"localhost:5000"}}

echo "🔧 Configuring Nginx for backend: $BACKEND_URL"

# Replace placeholder with actual backend URL in nginx config
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "📁 Generated Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
nginx -t || (echo "❌ Nginx configuration test failed" && exit 1)

echo "✅ Configuration complete. Starting Nginx..."

# Start nginx in foreground
exec nginx -g "daemon off;"