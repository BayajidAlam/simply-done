# SimplyDone: A Highly Available, Containerized Notes & To-Do Application

## Table of Contents

- [Problem Statement](#problem-statement)
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Deployment Commands](#deployment-commands)
- [Application URLs](#application-urls)
- [Auto Scaling Across Multiple AZs](#auto-scaling-across-multiple-azs)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)
- [Scaling for High Load](#scaling-for-high-load)

## Problem Statement

We have to create a Notes & To-Do application named SimplyDone, containerize both the frontend and backend, and publish the containers to Docker Hub. These containers will be deployed across multiple AWS EC2 instances to ensure fault tolerance. An Application Load Balancer (ALB) will be implemented to distribute traffic and provide high availability across instances.

## Project Overview

This project aims to develop a robust, cloud-native Notes & To-Do application by leveraging modern containerization and cloud deployment technologies. The application, consisting of a React frontend and Node.js backend, will be containerized using Docker to ensure consistency, portability, and simplified deployments across environments. These Docker images will be published to Docker Hub for centralized access and reuse.

The backend containers will be deployed across multiple AWS EC2 instances managed by an autoscaling group to ensure high availability and fault tolerance. Autoscaling will dynamically adjust the number of backend instances (2-5) to match traffic demands, optimizing performance and cost-efficiency. An Application Load Balancer (ALB) will be implemented to distribute incoming traffic evenly across backend instances, ensuring smooth operation and reliable user experiences.

The frontend will be containerized and deployed to EC2, remaining independent of the autoscaling and load balancing configuration used for the backend. This architecture delivers a scalable, resilient, and efficient solution for modern cloud-based application deployment.

## Architecture Overview

The SimplyDone Notes & To-Do Application consists of three main components:

<img width="1369" height="620" alt="Screenshot from 2025-07-28 02-01-32" src="https://github.com/user-attachments/assets/3787643f-4565-4a9a-9ad9-a02d40cba8b1" />



**1. Frontend:**
- A React.js application with TypeScript that provides an intuitive interface for managing Notes and To-Do tasks
- Features note creation, editing, archiving, and trash management
- Support for both regular notes and todo-style notes with checklist functionality
- Communicates with the backend API to perform CRUD operations
- Containerized with Docker for portability and consistent deployment
- Uses Nginx as reverse proxy with automatic ALB configuration

**2. Backend:**
- A **Node.js** application with **Express** and **TypeScript**, exposing a **REST API** for notes and task management
- Supports both regular notes and todo-style notes with status management (active, archived, trashed)
- Uses **Local MongoDB** instance for persistent storage (budget-friendly approach)
- JWT-based authentication with user registration and login
- Containerized with **Docker** for easy scalability and fault tolerance
- Automatically scales between 2-5 instances based on demand

**3. Infrastructure:**
- Managed using **Pulumi** for automated, version-controlled infrastructure provisioning
- **Multi-AZ deployment** across 3 availability zones (ap-southeast-1a, 1b, 1c) for maximum fault tolerance
- **AWS EC2 instances** host the frontend and backend containers across multiple AZs, ensuring scalability and fault tolerance
- **Auto Scaling Group** for backend EC2 instances spanning multiple AZs to dynamically handle varying traffic loads
- **Application Load Balancer (ALB)** ensures high availability by distributing traffic evenly across healthy EC2 instances in different AZs
- **Local MongoDB** instance deployed in dedicated AZ for data persistence

The architecture includes:
- **Docker containers** for both frontend and backend, ensuring consistency across environments
- **Multi-AZ deployment** across 3 availability zones for maximum fault tolerance and disaster recovery
- **Multiple EC2 instances** distributed across AZs for scalability and fault tolerance
- **Application Load Balancer (ALB)** for optimized traffic distribution and high availability across AZs
- **Automated IP management** through Pulumi → Ansible integration

## Features

- **Multi-AZ High Availability**: Deployed across 3 availability zones (ap-southeast-1a, 1b, 1c) for maximum fault tolerance and disaster recovery
- **Cross-AZ Load Balancing**: ALB distributes traffic across instances in different availability zones
- **Zone-Isolated Database**: MongoDB deployed in dedicated AZ (1c) for data isolation and performance
- **Advanced Note Management**: Create, edit, archive, and delete notes with rich text content
- **Todo Integration**: Support for both regular notes and checklist-style todo notes
- **Status Management**: Three-tier organization (Active, Archived, Trashed) for better note organization
- **Search Functionality**: Search through notes by title and content
- **Real-time Updates**: Live note counts and status updates across different sections
- **Scalable Deployment**: Deployed on multiple AWS EC2 instances for horizontal scaling to handle increased traffic
- **Fault Tolerance**: Multiple EC2 instances ensure high availability, with other instances serving requests in case of failure
- **Application Load Balancer (ALB)**: Distributes traffic evenly across EC2 instances, optimizing resource use and user experience
- **Docker Hub Integration**: Frontend and backend containers are published to Docker Hub for easy access and automated deployment
- **Cloud-Native Architecture**: Utilizes AWS services like EC2 and ALB for scalability, resilience, and security
- **Automated Deployment**: Complete Infrastructure as Code with one-command deployment
- **Budget-Friendly**: Uses local MongoDB instead of Atlas for cost optimization
- **Environment-Based Configuration**: Automatic switching between development (Atlas) and production (local MongoDB)
- **CORS Handling**: Automatic CORS configuration for seamless frontend-backend communication

## Technology Stack

- **Frontend**: 
  - React with TypeScript for type safety and better development experience
  - Tailwind CSS for responsive, modern styling
  - Shadcn/ui for consistent, accessible UI components
  - React Hook Form for efficient form handling and validation
  - Zod for runtime type validation
  - React Toastify for user notifications and feedback
  - React Query (TanStack Query) for server state management
  - React Router for client-side routing
  - Axios for HTTP client with interceptors
  - Nginx for reverse proxy and static file serving
  - Docker for containerization

- **Backend**: 
  - Node.js with Express and TypeScript
  - MongoDB for database
  - JWT for authentication
  - bcrypt for password hashing
  - Docker multi-stage builds for optimized containers

- **Database**:
  - **Production**: Local MongoDB instance (budget-friendly)
  - **Development**: MongoDB Atlas (cloud convenience)

- **Containerization**: 
  - Docker for creating, managing, and deploying containers
  - Docker Hub for publishing and accessing the container images
  - Multi-stage builds for optimized production images

- **Cloud Infrastructure**: 
  - AWS EC2 for hosting the application instances
  - AWS Application Load Balancer (ALB) for traffic distribution across instances
  - AWS Auto Scaling Group for dynamic scaling

- **Networking**: 
  - AWS VPC with multi-AZ subnets for high availability
  - Public subnets in 2 AZs (1a, 1b) for ALB and bastion access
  - Private subnets in 3 AZs (1a, 1b for apps, 1c for database)
  - AWS Security Groups for managing access control to EC2 instances
  - AWS NAT Gateway for enabling internet access from private subnets

- **DevOps**: 
  - Pulumi as Infrastructure as Code to manage AWS resources and automate deployments
  - Ansible for configuration management and automated deployments
  - Makefile for simplified deployment commands

## Folder Structure

- `/client` : **Frontend**
  - `/public`: Static files and assets
  - `/src`: Core application code
  - `Dockerfile`: Frontend multi-stage Dockerfile
  - `nginx.conf.template`: Nginx configuration template with ALB integration
  - `docker-entrypoint.sh`: Runtime configuration script
  - `package.json`: Dependencies and scripts

- `/server`: **Backend**
  - `/src`: Backend source code
  - `Dockerfile`: Backend multi-stage Dockerfile  
  - `package.json`: Dependencies and scripts

- `/pulumi_IaC`: **Infrastructure** 
  - `index.ts`: Pulumi IaC files for managing AWS resources
  - `/ansible`: Configuration management and deployment automation
  - `/scripts`: Utility scripts for inventory management

- `docker-compose.yml`: Local development environment configuration
- `Makefile`: Automated deployment commands and shortcuts

## Prerequisites

Before deploying the application, ensure you have the following:

- An **AWS account** with EC2 and ALB setup permissions
- **Docker** installed on your local machine for building containers
- **AWS CLI** installed and configured with your credentials
- A **Docker Hub account** to push your Docker images for accessibility
- **Node.js** (version 18 or above) and **yarn** installed for both frontend and backend applications
- **Pulumi** installed for managing AWS infrastructure as code
- **Ansible** installed for configuration management
- **TypeScript** (version 5 or above) installed for both frontend and backend

## Getting Started

Follow these steps to get the application up and running:

**1. Clone the Repository**

```bash
git clone https://github.com/yourusername/simply-done.git
cd simply-done
```

**2. Install Dependencies**

```bash
# Frontend
cd client
yarn install

# Backend  
cd ../server
yarn install
cd ..
```

**3. Set Up Environment Variables**

#### For Local Development:

Create a `.env` file in the `/server` directory:

```bash
# MongoDB Atlas credentials for development
DB_USER=your_atlas_username
DB_PASS=your_atlas_password
ACCESS_TOKEN_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRES_IN=12h
NODE_ENV=development
```

Create a `.env` file in the `/client` directory:

```bash
# Backend URL (will be auto-configured for production)
VITE_APP_BACKEND_ROOT_URL=http://localhost:5000
```

**Note**: Production environment variables are automatically configured by the deployment pipeline.

## Deployment Commands

The application provides automated deployment commands via Makefile:

**Complete Deployment (Recommended)**
```bash
make auto-deploy
```
This runs the complete deployment pipeline: infrastructure → backend → frontend.

**Individual Components**
```bash
# Deploy AWS infrastructure
make setup-infrastructure

# Deploy backend services  
make setup-backend

# Deploy frontend
make deploy-frontend-with-alb

# Build and deploy containers
make build-deploy
```

**Development & Testing**
```bash
# Build Docker images
make build-all

# Push to Docker Hub
make push-all

# Test deployment health
make test-deployment

# Debug system status
make debug-system

# Emergency redeploy
make emergency-redeploy
```

**Cleanup**
```bash
# Clean local resources
make clean-all

# Destroy all AWS resources
cd pulumi_IaC
pulumi destroy --yes
```

## Application URLs

After successful deployment, your application will be accessible at:

- **Frontend**: `http://<FRONTEND_PUBLIC_IP>` (auto-displayed after deployment)
- **Backend API**: `http://<ALB_DNS_NAME>` (auto-configured)
- **Health Check**: `http://<ALB_DNS_NAME>/health`

Example URLs:
- Frontend: `http://54.179.59.231`
- Backend: `http://alb-41653d7-2112601569.ap-southeast-1.elb.amazonaws.com`

## Auto Scaling Across Multiple AZs

Our autoscaling setup distributes backend instances across multiple availability zones for maximum fault tolerance and performance.

### Multi-AZ Configuration

**Availability Zones:**
- **AZ-A (ap-southeast-1a)**: Private subnet for backend instances (10.10.3.0/24)
- **AZ-B (ap-southeast-1b)**: Private subnet for backend instances (10.10.4.0/24)  
- **AZ-C (ap-southeast-1c)**: Private subnet for MongoDB (10.10.5.0/24)

**Auto Scaling Group Configuration:**
```bash
Desired Capacity: 2 instances
Minimum Size: 1 instance
Maximum Size: 5 instances
Health Check: ELB with 300 seconds grace period
```

### Instance Distribution

**Initial Deployment (2 instances):**
```
AZ-A: 1 backend instance
AZ-B: 1 backend instance
```

**Scale-Up Scenarios:**
```
3 instances: AZ-A (2), AZ-B (1) or AZ-A (1), AZ-B (2)
4 instances: AZ-A (2), AZ-B (2) 
5 instances: AZ-A (3), AZ-B (2) or AZ-A (2), AZ-B (3)
```

### Scaling Triggers

**Scale-Up Policy:**
- Triggers when CPU utilization > 80% for 4 minutes
- Adds 1 instance with 5-minute cooldown
- New instance deploys to AZ with fewer instances

**Scale-Down Policy:**
- Triggers when CPU utilization < 10% for 4 minutes  
- Removes 1 instance with 5-minute cooldown
- Maintains minimum 1 instance for availability

### Fault Tolerance Benefits

**Single AZ Failure Scenario:**
1. ALB automatically stops routing traffic to failed AZ
2. Remaining instances in healthy AZ handle all traffic
3. Autoscaling detects unhealthy instances and replaces them
4. When failed AZ recovers, instances redistribute automatically

**Load Balancer Integration:**
- ALB spans public subnets in AZ-A and AZ-B
- Routes traffic only to healthy backend instances
- Performs health checks every 30 seconds
- Automatically registers new instances from autoscaling

## Troubleshooting

**Common Issues:**

1. **502 Bad Gateway**: Backend containers not healthy
   ```bash
   make debug-system
   make setup-backend
   ```

2. **CORS Errors**: Frontend can't communicate with backend
   ```bash
   make quick-redeploy
   ```

3. **Cannot GET /register or /login**: Nginx routing issue
   - Check nginx configuration excludes React routes from API proxy

4. **Database Connection Issues**: 
   ```bash
   # Check MongoDB status
   ssh -i pulumi_IaC/MyKeyPair.pem ubuntu@<mongodb-ip>
   sudo docker logs mongodb
   ```

**Debug Commands:**
```bash
# System overview
make debug-system

# Network connectivity  
make debug-network

# Deployment health
make test-deployment

# Container logs
sudo docker logs -f simply-done-server
sudo docker logs -f simply-done-client
```

## API Documentation

This section provides a detailed description of all the APIs, including their request payloads, query parameters, URL parameters, and responses.

### Base URLs

**Production**: `http://<ALB_DNS_NAME>`
**Development**: `http://localhost:5000`

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Health Check (GET)
```
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Up and running!",
  "data": {
    "timestamp": "2025-07-25T05:37:41.600Z"
  }
}
```

#### Register User (POST)
```
POST /users
```
**Request Body:**
```json
{
  "userName": "testuser",
  "email": "test@example.com", 
  "password": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "688296acc88160ada2221a65"
  }
}
```

#### Login User (POST)
```
POST /login
```
**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "test@example.com",
    "userName": "testuser"
  }
}
```

#### Get All Users (GET) - Protected
```
GET /users
Authorization: Bearer <token>
```
**Response:**
```json
[
  {
    "_id": "688296acc88160ada2221a65",
    "userName": "testuser",
    "email": "test@example.com",
    "createdAt": "2025-07-24T20:25:16.032Z"
  }
]
```

#### Change Password (POST) - Protected
```
POST /change-password
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```
**Response:**
```json
{
  "error": false,
  "message": "Password changed successfully!",
  "data": {
    "acknowledged": true,
    "modifiedCount": 1
  }
}
```

### Notes Management

#### Get All Notes (GET) - Protected
```
GET /notes?email=user@example.com&status=active&searchTerm=keyword
Authorization: Bearer <token>
```
**Query Parameters:**
- `email` (required): User's email
- `status` (optional): Filter by status (active, archived, trashed)
- `searchTerm` (optional): Search in title and content

**Response:**
```json
{
  "success": true,
  "message": "Notes fetched successfully",
  "data": [
    {
      "_id": "60f7b1b9e1b9c72c88f8e123",
      "title": "My Note",
      "content": "Note content here",
      "status": "active",
      "email": "user@example.com",
      "isTodo": false,
      "todos": [],
      "createdAt": "2025-07-24T20:25:16.032Z"
    }
  ]
}
```

#### Create Note (POST) - Protected
```
POST /notes?email=user@example.com
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "My New Note",
  "content": "This is the content",
  "isTodo": true,
  "todos": [
    {
      "id": "1",
      "text": "First task",
      "isCompleted": false
    }
  ],
  "status": "active"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "60f7b1b9e1b9c72c88f8e123",
    "title": "My New Note",
    "content": "This is the content",
    "status": "active",
    "email": "user@example.com",
    "isTodo": true,
    "todos": [...],
    "createdAt": "2025-07-24T20:25:16.032Z"
  }
}
```

#### Get Single Note (GET) - Protected
```
GET /notes/:id?email=user@example.com
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Note fetched successfully",
  "data": {
    "_id": "60f7b1b9e1b9c72c88f8e123",
    "title": "My Note",
    "content": "Note content",
    "status": "active",
    "email": "user@example.com",
    "isTodo": false,
    "createdAt": "2025-07-24T20:25:16.032Z"
  }
}
```

#### Update Note (PATCH) - Protected
```
PATCH /notes/:id?email=user@example.com
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "archived",
  "todos": [
    {
      "id": "1",
      "text": "Updated task",
      "isCompleted": true
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "_id": "60f7b1b9e1b9c72c88f8e123",
    "title": "Updated Title",
    "content": "Updated content",
    "status": "archived",
    "updatedAt": "2025-07-25T10:30:00.000Z"
  }
}
```

#### Delete Note (DELETE) - Protected
```
DELETE /notes/:id?email=user@example.com
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### Error Responses

All endpoints return error responses in this format:
```json
{
  "error": true,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created  
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

**Note Status Values:**
- `active` - Regular active notes (default)
- `archived` - Archived notes for later reference
- `trashed` - Deleted notes (can be restored or permanently deleted)

## Scaling for High Load

### Current Multi-AZ Features
- **3-AZ Distribution** across ap-southeast-1a, 1b, and 1c
- **Cross-AZ Auto Scaling** with 2-5 backend instances
- **Zone-Level Fault Tolerance** with automatic traffic routing
- **Isolated Database Zone** for performance optimization

### Upgrade Path for High Traffic
1. **Database**: Migrate to AWS DocumentDB + Redis caching
2. **Scaling**: Increase to 10+ instances with request-based metrics  
3. **Performance**: Enable gzip compression and API rate limiting
4. **Containers**: Move to ECS/Fargate for better management
5. **Frontend**: Use S3 + CloudFront for static assets

Your current architecture provides a solid foundation for incremental scaling.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support and questions, please open an issue in the GitHub repository.
