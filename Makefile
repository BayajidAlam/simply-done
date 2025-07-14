# Docker image names
FRONTEND_IMAGE=bayajid23/simply-done-client
BACKEND_IMAGE=bayajid23/simply-done-server

# Directories
FRONTEND_DIR=client
BACKEND_DIR=server
PULUMI_DIR=pulumi_IaC

# Environment variables
ENV_FILE=$(FRONTEND_DIR)/.env

# Get ALB DNS from Pulumi (robust method)
GET_ALB_DNS = $(shell cd $(PULUMI_DIR) && pulumi stack output albDnsName 2>/dev/null || echo "")
GET_FRONTEND_IP = $(shell cd $(PULUMI_DIR) && pulumi stack output frontendInstancePublicIp 2>/dev/null || echo "")

.PHONY: build-frontend build-backend push-frontend push-backend build-all push-all clean clear up down logs setup-ansible run-ansible deploy-all help redeploy-frontend

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
	@echo "  redeploy-frontend : Redeploy frontend with correct backend URL"
	@echo "  clean          : Clean up Docker images and environment files"
	@echo "  up             : Start containers using docker-compose (local)"
	@echo "  down           : Stop and remove containers (local)"
	@echo "  logs           : View container logs (local)"

.DEFAULT_GOAL := help

# Generate nginx config from template
generate-nginx-config:
	@ALB_DNS="$(GET_ALB_DNS)"; \
	if [ -n "$$ALB_DNS" ] && [ "$$ALB_DNS" != "" ]; then \
		echo "🔧 Generating nginx.conf with ALB DNS: $$ALB_DNS"; \
		sed "s/ALB_DNS_PLACEHOLDER/$$ALB_DNS/g" $(FRONTEND_DIR)/nginx.conf.template > $(FRONTEND_DIR)/nginx.conf; \
		echo "✅ nginx.conf generated successfully"; \
	else \
		echo "❌ Error: Could not get ALB DNS for nginx config"; \
		exit 1; \
	fi

# Setup environment for frontend with robust backend URL detection
setup-frontend-env:
	@echo "Setting up frontend environment..."
	@echo "# Backend API URL" > $(FRONTEND_DIR)/.env
	@ALB_DNS="$(GET_ALB_DNS)"; \
	if [ -n "$$ALB_DNS" ] && [ "$$ALB_DNS" != "" ]; then \
		echo "VITE_APP_BACKEND_ROOT_URL=http://$$ALB_DNS" >> $(FRONTEND_DIR)/.env; \
		echo "✅ Frontend configured with backend URL: http://$$ALB_DNS"; \
	else \
		echo "VITE_APP_BACKEND_ROOT_URL=" >> $(FRONTEND_DIR)/.env; \
		echo "⚠️  No ALB DNS found - using empty backend URL"; \
		echo "💡 Make sure infrastructure is deployed first"; \
	fi
	
# Build the frontend image with robust backend URL detection
build-frontend: generate-nginx-config setup-frontend-env
	@echo "Building frontend image..."
	@ALB_DNS="$(GET_ALB_DNS)"; \
	if [ -n "$$ALB_DNS" ] && [ "$$ALB_DNS" != "" ]; then \
		echo "Building with backend URL: http://$$ALB_DNS"; \
		docker build \
			-t $(FRONTEND_IMAGE):latest \
			--build-arg VITE_APP_BACKEND_ROOT_URL="http://$$ALB_DNS" \
			-f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR); \
	else \
		echo "⚠️  Building with empty backend URL"; \
		docker build \
			-t $(FRONTEND_IMAGE):latest \
			--build-arg VITE_APP_BACKEND_ROOT_URL="" \
			-f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR); \
	fi

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

# Debug ALB detection
debug-alb:
	@echo "Debugging ALB detection..."
	@echo "Current directory: $(shell pwd)"
	@echo "Pulumi directory exists: $(shell test -d $(PULUMI_DIR) && echo "YES" || echo "NO")"
	@echo "ALB DNS: $(GET_ALB_DNS)"
	@echo "Frontend IP: $(GET_FRONTEND_IP)"
	@cd $(PULUMI_DIR) && echo "Stack outputs:" && pulumi stack output

# Redeploy frontend with correct backend URL (robust version)
redeploy-frontend:
	@echo "🔄 Redeploying frontend with correct backend URL..."
	@ALB_DNS="$(GET_ALB_DNS)"; \
	FRONTEND_IP="$(GET_FRONTEND_IP)"; \
	if [ -z "$$ALB_DNS" ] || [ "$$ALB_DNS" = "" ]; then \
		echo "❌ Error: Could not get ALB DNS. Make sure infrastructure is deployed."; \
		echo "💡 Try: cd $(PULUMI_DIR) && pulumi stack output albDnsName"; \
		exit 1; \
	fi; \
	if [ -z "$$FRONTEND_IP" ] || [ "$$FRONTEND_IP" = "" ]; then \
		echo "❌ Error: Could not get Frontend IP. Make sure infrastructure is deployed."; \
		exit 1; \
	fi; \
	echo "🔗 Backend URL: http://$$ALB_DNS"; \
	echo "🌐 Frontend IP: $$FRONTEND_IP"; \
	echo "🔧 Generating nginx.conf with ALB DNS..."; \
	sed "s/ALB_DNS_PLACEHOLDER/$$ALB_DNS/g" $(FRONTEND_DIR)/nginx.conf.template > $(FRONTEND_DIR)/nginx.conf; \
	echo "📦 Building frontend with backend URL..."; \
	echo "# Backend API URL" > $(FRONTEND_DIR)/.env; \
	echo "VITE_APP_BACKEND_ROOT_URL=http://$$ALB_DNS" >> $(FRONTEND_DIR)/.env; \
	docker build \
		-t $(FRONTEND_IMAGE):latest \
		--build-arg VITE_APP_BACKEND_ROOT_URL="http://$$ALB_DNS" \
		-f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR); \
	docker push $(FRONTEND_IMAGE):latest; \
	echo "🚀 Updating frontend container..."; \
	ssh -i $(PULUMI_DIR)/MyKeyPair.pem ubuntu@$$FRONTEND_IP \
		"docker stop simply-done-client && docker rm simply-done-client && docker rmi bayajid23/simply-done-client:latest && docker pull $(FRONTEND_IMAGE):latest && docker run -d --name simply-done-client -p 80:80 $(FRONTEND_IMAGE):latest"; \
	echo "✅ Frontend redeployed with backend URL: http://$$ALB_DNS"

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
	@echo "🔄 Updating frontend with correct backend URL..."
	make redeploy-frontend
	@echo "✅ Deployment complete!"
	@echo "🎯 ASG will automatically manage backend scaling (2-5 instances)"
	@echo "🌍 Frontend accessible via frontend IP"
	@echo "🔗 ALB URL: http://$(GET_ALB_DNS)"
	@echo "🌐 Frontend URL: http://$(GET_FRONTEND_IP)"

# Clean up local Docker images and environment files
clean:
	@echo "Cleaning up local Docker images and environment files..."
	-docker rmi $(FRONTEND_IMAGE):latest $(BACKEND_IMAGE):latest 2>/dev/null || true
	-rm -f $(ENV_FILE)
	-rm -f $(FRONTEND_DIR)/nginx.conf

# Local development with docker-compose
up:
	@echo "Starting containers locally..."
	docker-compose up -d

down:
	@echo "Stopping local containers..."
	docker-compose down -v --remove-orphans

logs:
	docker-compose logs -f