# Docker image names
FRONTEND_IMAGE=bayajid23/simply-done-client
BACKEND_IMAGE=bayajid23/simply-done-server

# Directories
FRONTEND_DIR=client
BACKEND_DIR=server
PULUMI_DIR=pulumi_IaC

# Environment variables
ENV_FILE=$(FRONTEND_DIR)/.env

.PHONY: build-frontend build-backend push-frontend push-backend build-all push-all clean clear up down logs setup-ansible run-ansible deploy-all help

# Help target
help:
	@echo "Available targets:"
	@echo "  build-frontend  : Build the frontend Docker image"
	@echo "  build-backend   : Build the backend Docker image"
	@echo "  build-all      : Build both frontend and backend images"
	@echo "  push-frontend  : Push frontend image to Docker Hub"
	@echo "  push-backend   : Push backend image to Docker Hub"
	@echo "  push-all       : Push both images to Docker Hub"
	@echo "  deploy-all     : Complete deployment (build, push, infrastructure, provision)"
	@echo "  clean          : Clean up Docker images and environment files"
	@echo "  up             : Start containers using docker-compose (local)"
	@echo "  down           : Stop and remove containers (local)"
	@echo "  logs           : View container logs (local)"

.DEFAULT_GOAL := help

# Setup environment for frontend
setup-frontend-env:
	@echo "Setting up frontend environment..."
	@cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env
	@sed -i '/VITE_APP_BACKEND_ROOT_URL/d' $(FRONTEND_DIR)/.env
	@echo "VITE_APP_BACKEND_ROOT_URL=" >> $(FRONTEND_DIR)/.env

# Build the frontend image
build-frontend: setup-frontend-env
	@echo "Building frontend image..."
	docker build \
		-t $(FRONTEND_IMAGE):latest \
		--build-arg VITE_APP_BACKEND_ROOT_URL="" \
		-f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)

# Build the backend image
build-backend:
	@echo "Building backend image..."
	docker build \
		-t $(BACKEND_IMAGE):latest \
		-f $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)

# Push the frontend image to Docker Hub
push-frontend: build-frontend
	@echo "Pushing frontend image to Docker Hub..."
	docker push $(FRONTEND_IMAGE):latest

# Push the backend image to Docker Hub
push-backend: build-backend
	@echo "Pushing backend image to Docker Hub..."
	docker push $(BACKEND_IMAGE):latest

# Build both images
build-all: build-frontend build-backend

# Push both images
push-all: push-frontend push-backend

# Setup Ansible inventory
setup-ansible:
	@echo "Setting up Ansible inventory..."
	cd $(PULUMI_DIR) && \
	npm install js-yaml @types/js-yaml && \
	npx ts-node scripts/updateHosts.ts

# Run Ansible playbook for frontend only
run-ansible:
	@echo "Running Ansible playbook for frontend..."
	cd $(PULUMI_DIR) && ansible-playbook -i ansible/inventory/hosts.yml ansible/site.yml

# Run MongoDB playbook
run-mongodb-playbook:
	@echo "Running MongoDB Ansible playbook..."
	ansible-playbook -i $(PULUMI_DIR)/ansible/inventory/hosts.yml $(PULUMI_DIR)/ansible/provision_mongodb.yml

# MAIN DEPLOY COMMAND - Complete deployment
deploy-all: push-all
	@echo "🚀 Starting complete deployment..."
	@echo "📦 Images pushed to Docker Hub"
	@echo "🏗️  Deploying infrastructure with Pulumi..."
	cd $(PULUMI_DIR) && pulumi up --yes
	@echo "⏳ Waiting for instances to boot (90 seconds)..."
	sleep 90
	@echo "🗄️  Setting up MongoDB..."
	make run-mongodb-playbook
	@echo "⏳ Waiting for MongoDB to be ready (30 seconds)..."
	sleep 30
	@echo "🌐 Setting up frontend..."
	make setup-ansible
	make run-ansible
	@echo "✅ Deployment complete!"
	@echo "🎯 ASG will automatically manage backend scaling (2-5 instances)"
	@echo "🌍 Frontend accessible via ALB DNS name"

# Clean up local Docker images and environment files
clean:
	@echo "Cleaning up local Docker images and environment files..."
	-docker rmi $(FRONTEND_IMAGE):latest $(BACKEND_IMAGE):latest 2>/dev/null || true
	-rm -f $(ENV_FILE)

# Local development with docker-compose
up:
	@echo "Starting containers locally..."
	docker-compose up -d

down:
	@echo "Stopping local containers..."
	docker-compose down -v --remove-orphans

logs:
	docker-compose logs -f