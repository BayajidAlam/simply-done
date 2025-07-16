#!/bin/sh
set -e

echo "🚀 Starting SimplyDone Frontend with Runtime Configuration"

# Get backend URL from environment variable
BACKEND_URL=${BACKEND_URL:-"localhost:5000"}

echo "🔧 Configuring Nginx for backend: $BACKEND_URL"

# Replace placeholder with actual backend URL
sed "s/BACKEND_URL_PLACEHOLDER/$BACKEND_URL/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "📁 Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
nginx -t || (echo "❌ Nginx configuration test failed" && exit 1)

echo "✅ Configuration complete. Starting Nginx..."

# Start nginx in foreground
exec nginx -g "daemon off;"