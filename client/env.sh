#!/bin/sh

# Replace environment variable placeholders
sed -i "s|__BACKEND_URL__|$VITE_APP_BACKEND_ROOT_URL|g" /usr/share/nginx/html/index.html 