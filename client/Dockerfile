# Stage 1: Build the frontend
FROM node:18 AS builder 
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Serve the frontend
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Make port 80 available to the world outside this container
EXPOSE 80

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
