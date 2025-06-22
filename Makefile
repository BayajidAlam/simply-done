# Docker image names
FRONTEND_IMAGE=bayajid23/simply-done-client
BACKEND_IMAGE=bayajid23/simply-done-server

# Directories
FRONTEND_DIR=client
BACKEND_DIR=server
PULUMI_DIR=pulumi_IaC

# Environment variables
ENV_FILE=$(FRONTEND_DIR)/.env

.PHONY: build-frontend build-backend push-frontend push-backend build-all push-all clean clear up down logs setup-ansible run-ansible deploy

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

# Clean up local Docker images and environment files
clean:
	@echo "Cleaning up local Docker images and environment files..."
	-docker rmi $(FRONTEND_IMAGE):latest $(BACKEND_IMAGE):latest 2>/dev/null || true
	-rm -f $(ENV_FILE)

# Run both containers using docker-compose
up:
	@echo "Starting containers..."
	docker-compose up -d

# Stop and remove containers, networks, and volumes created by docker-compose
down:
	@echo "Stopping containers and cleaning up..."
	docker-compose down -v --remove-orphans

# Tail logs from docker-compose
logs:
	docker-compose logs -f

# Setup Ansible inventory
setup-ansible:
	@echo "Setting up Ansible inventory..."
	cd $(PULUMI_DIR) && \
	npm install js-yaml @types/js-yaml && \
	npx ts-node scripts/updateHosts.ts

# Run Ansible playbook
run-ansible:
	@echo "Running Ansible playbook..."
	cd $(PULUMI_DIR) && ansible-playbook -i ansible/inventory/hosts.yml ansible/site.yml

run-mongodb-playbook:
	@echo "Running MongoDB Ansible playbook..."
	ansible-playbook -i $(PULUMI_DIR)/ansible/inventory/hosts.yml $(PULUMI_DIR)/ansible/provision_mongodb.yml

# Run Backend playbook
run-backend-playbook:
	@echo "Running Backend Ansible playbook..."
	ansible-playbook -i $(PULUMI_DIR)/ansible/inventory/hosts.yml $(PULUMI_DIR)/ansible/provision_backend.yml

# Deploy everything
deploy: push-all setup-ansible run-mongodb-playbook run-backend-playbook run-ansible
	@echo "Deployment complete!"

# Help target
help:
	@echo "Available targets:"
	@echo "  build-frontend  : Build the frontend Docker image"
	@echo "  build-backend   : Build the backend Docker image"
	@echo "  build-all      : Build both frontend and backend images"
	@echo "  push-frontend  : Push frontend image to Docker Hub"
	@echo "  push-backend   : Push backend image to Docker Hub"
	@echo "  push-all       : Push both images to Docker Hub"
	@echo "  clean          : Clean up Docker images and environment files"
	@echo "  up             : Start containers using docker-compose"
	@echo "  down           : Stop and remove containers"
	@echo "  logs           : View container logs"
	@echo "  setup-ansible  : Setup Ansible inventory"
	@echo "  run-ansible    : Run Ansible playbook"
	@echo "  deploy         : Deploy everything"

.DEFAULT_GOAL := help