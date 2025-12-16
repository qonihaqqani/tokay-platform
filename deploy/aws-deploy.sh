#!/bin/bash

# Tokay Resilience Platform - AWS Deployment Script
# Deploys to AWS Singapore region (ap-southeast-1)

set -e

# Configuration
AWS_REGION="ap-southeast-1"
ECR_REPOSITORY="tokay-platform"
CLUSTER_NAME="tokay-cluster"
SERVICE_NAME="tokay-service"
TASK_FAMILY="tokay-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    log_info "AWS CLI is installed"
}

# Check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_info "AWS credentials are configured"
    aws configure get region
}

# Create ECR repository
create_ecr_repository() {
    log_info "Creating ECR repository: $ECR_REPOSITORY"
    
    aws ecr create-repository \
        --repository-name "$ECR_REPOSITORY" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true \
        --image-tag-mutability MUTABLE \
        || log_warn "ECR repository already exists"
    
    # Get repository URI
    ECR_URI=$(aws ecr describe-repositories \
        --repository-names "$ECR_REPOSITORY" \
        --region "$AWS_REGION" \
        --query 'repositories[0].repositoryUri' \
        --output text)
    
    log_info "ECR Repository URI: $ECR_URI"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images to ECR"
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_URI"
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t "$ECR_REPOSITORY:backend-latest" ./server
    docker tag "$ECR_REPOSITORY:backend-latest" "$ECR_URI:backend-latest"
    docker push "$ECR_URI:backend-latest"
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t "$ECR_REPOSITORY:frontend-latest" ./client
    docker tag "$ECR_REPOSITORY:frontend-latest" "$ECR_URI:frontend-latest"
    docker push "$ECR_URI:frontend-latest"
    
    log_info "Images pushed successfully to ECR"
}

# Create ECS task definition
create_task_definition() {
    log_info "Creating ECS task definition"
    
    # Generate task definition JSON
    cat > task-definition.json <<EOF
{
    "family": "$TASK_FAMILY",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
    "taskRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskRole",
    "containerDefinitions": [
        {
            "name": "tokay-backend",
            "image": "$ECR_URI:backend-latest",
            "portMappings": [
                {
                    "containerPort": 5000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "DB_HOST",
                    "value": "$RDS_ENDPOINT"
                },
                {
                    "name": "DB_NAME",
                    "value": "$DB_NAME"
                },
                {
                    "name": "DB_USER",
                    "value": "$DB_USER"
                },
                {
                    "name": "REDIS_HOST",
                    "value": "$REDIS_ENDPOINT"
                }
            ],
            "secrets": [
                {
                    "name": "DB_PASSWORD",
                    "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:tokay/db-password"
                },
                {
                    "name": "JWT_SECRET",
                    "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:tokay/jwt-secret"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/tokay",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 60
            }
        },
        {
            "name": "tokay-frontend",
            "image": "$ECR_URI:frontend-latest",
            "portMappings": [
                {
                    "containerPort": 80,
                    "protocol": "tcp"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/tokay",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "dependsOn": [
                {
                    "containerName": "tokay-backend",
                    "condition": "HEALTHY"
                }
            ]
        }
    ]
}
EOF

    # Register task definition
    aws ecs register-task-definition \
        --cli-input-json file://task-definition.json \
        --region "$AWS_REGION"
    
    log_info "Task definition created"
}

# Create ECS cluster
create_ecs_cluster() {
    log_info "Creating ECS cluster: $CLUSTER_NAME"
    
    aws ecs create-cluster \
        --cluster-name "$CLUSTER_NAME" \
        --region "$AWS_REGION" \
        || log_warn "ECS cluster already exists"
    
    log_info "ECS cluster created/verified"
}

# Create ECS service
create_ecs_service() {
    log_info "Creating ECS service: $SERVICE_NAME"
    
    # Get subnets and security group
    VPC_ID=$(aws ec2 describe-vpcs --region "$AWS_REGION" --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)
    SUBNETS=$(aws ec2 describe-subnets --region "$AWS_REGION" --filters Name=vpc-id,Values="$VPC_ID" --query 'Subnets[0:2].SubnetId' --output text | tr '\t' ',')
    SECURITY_GROUP=$(aws ec2 create-security-group --group-name tokay-sg --description "Tokay security group" --vpc-id "$VPC_ID" --region "$AWS_REGION" --query 'GroupId' --output text)
    
    # Allow HTTP and HTTPS traffic
    aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$AWS_REGION"
    aws ec2 authorize-security-group-ingress --group-id "$SECURITY_GROUP" --protocol tcp --port 443 --cidr 0.0.0.0/0 --region "$AWS_REGION"
    
    # Create service
    aws ecs create-service \
        --cluster "$CLUSTER_NAME" \
        --service-name "$SERVICE_NAME" \
        --task-definition "$TASK_FAMILY" \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=tokay-frontend,containerPort=80" \
        --region "$AWS_REGION" \
        || log_warn "ECS service already exists"
    
    log_info "ECS service created/updated"
}

# Create Application Load Balancer
create_load_balancer() {
    log_info "Creating Application Load Balancer"
    
    # Create ALB
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name tokay-alb \
        --subnets $SUBNETS \
        --security-groups "$SECURITY_GROUP" \
        --scheme internet-facing \
        --type application \
        --region "$AWS_REGION" \
        --query 'LoadBalancers[0].LoadBalancerArn' \
        --output text)
    
    # Create target group
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
        --name tokay-targets \
        --protocol HTTP \
        --port 80 \
        --target-type ip \
        --vpc-id "$VPC_ID" \
        --health-check-path "/health" \
        --region "$AWS_REGION" \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text)
    
    # Create listener
    aws elbv2 create-listener \
        --load-balancer-arn "$ALB_ARN" \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn="$TARGET_GROUP_ARN" \
        --region "$AWS_REGION"
    
    log_info "Load Balancer created"
    log_info "ALB DNS Name: $(aws elbv2 describe-load-balancers --load-balancer-arns "$ALB_ARN" --region "$AWS_REGION" --query 'LoadBalancers[0].DNSName' --output text)"
}

# Main deployment function
main() {
    log_info "Starting Tokay Platform deployment to AWS Singapore region"
    
    # Check prerequisites
    check_aws_cli
    check_aws_credentials
    
    # Load environment variables
    if [ -f .env.production ]; then
        source .env.production
        log_info "Loaded production environment variables"
    else
        log_error ".env.production file not found. Please create it with required variables."
        exit 1
    fi
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    # Deployment steps
    create_ecr_repository
    build_and_push_images
    create_ecs_cluster
    create_task_definition
    create_load_balancer
    create_ecs_service
    
    log_info "🎉 Tokay Platform deployment completed successfully!"
    log_info "Your application should be available at the ALB DNS name shown above."
    log_info "Don't forget to:"
    log_info "1. Configure your domain name to point to the ALB"
    log_info "2. Set up SSL certificates using AWS Certificate Manager"
    log_info "3. Configure Route 53 for DNS management"
    log_info "4. Set up CloudWatch alarms for monitoring"
}

# Run main function
main "$@"