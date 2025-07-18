# Stage 1: Build React app
FROM node:18 AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Stage 2: Runtime with Nginx
FROM nginx:1.25-alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copy and make entrypoint script executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create 50x.html error page
RUN echo '<html><body><h1>Service Temporarily Unavailable</h1><p>Please try again later.</p></body></html>' > /usr/share/nginx/html/50x.html

EXPOSE 80

# Use our custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]