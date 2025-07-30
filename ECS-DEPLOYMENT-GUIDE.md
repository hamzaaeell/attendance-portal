# ECS Deployment Guide for Attendance Management System

## Overview
This guide will help you deploy the attendance management system to AWS ECS using MongoDB Atlas as the database.

## Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed locally
- MongoDB Atlas cluster set up with the provided connection string

## Step 1: Set up ECR Repositories
```bash
# Make the script executable
chmod +x setup-ecr.sh

# Run the script to create ECR repositories
./setup-ecr.sh
```

## Step 2: Set up AWS Systems Manager Parameters (Recommended)
```bash
# Make the script executable
chmod +x setup-aws-parameters.sh

# Run the script to create secure parameters
./setup-aws-parameters.sh
```

## Step 3: Update Configuration Files
1. Replace `YOUR_ACCOUNT_ID` in all configuration files with your actual AWS account ID
2. Replace `YOUR_ECR_REPO` with your actual ECR repository URIs
3. Update the AWS region if different from `us-east-1`

## Step 4: Deploy Infrastructure (Option A - CloudFormation)
```bash
# Deploy the ECS infrastructure
aws cloudformation create-stack \
    --stack-name attendance-management-infra \
    --template-body file://ecs-infrastructure.yaml \
    --parameters ParameterKey=VpcId,ParameterValue=vpc-xxxxxxxx \
                 ParameterKey=SubnetIds,ParameterValue=subnet-xxxxxxxx,subnet-yyyyyyyy \
    --capabilities CAPABILITY_IAM \
    --region us-east-1
```

## Step 5: Deploy Application
```bash
# Make the deployment script executable
chmod +x deploy-to-ecs.sh

# Update the script with your specific values, then run:
./deploy-to-ecs.sh
```

## Step 6: Manual ECS Setup (Option B - If not using CloudFormation)

### Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name attendance-cluster
```

### Create Task Definition
```bash
# Update the task definition with your values
aws ecs register-task-definition --cli-input-json file://ecs-task-definition-secure.json
```

### Create ECS Service
```bash
aws ecs create-service \
    --cluster attendance-cluster \
    --service-name attendance-service \
    --task-definition attendance-management \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxx],securityGroups=[sg-xxxxxxxx],assignPublicIp=ENABLED}"
```

## Configuration Details

### MongoDB Atlas Integration
- **Connection String**: Already configured in your `.env` and deployment files
- **Database**: `attendance_db`
- **Collections**: Will be created automatically by the application

### Environment Variables
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `5001` for backend
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secure random string for JWT signing

### Security Considerations
1. **Use AWS Systems Manager Parameter Store** for sensitive data (recommended)
2. **Network Security**: Configure security groups to allow only necessary traffic
3. **Database Security**: Ensure MongoDB Atlas is configured with proper IP whitelisting
4. **SSL/TLS**: Enable HTTPS using Application Load Balancer with SSL certificate

### Monitoring and Logging
- **CloudWatch Logs**: All container logs are sent to CloudWatch
- **Log Group**: `/ecs/attendance-management`
- **Log Streams**: Separate streams for backend and frontend

## Accessing the Application
After successful deployment:
- **Frontend**: Access via the Application Load Balancer DNS name
- **API**: Backend API is accessible through the frontend proxy at `/api/*`

## Troubleshooting

### Common Issues
1. **Task fails to start**: Check CloudWatch logs for error messages
2. **Database connection issues**: Verify MongoDB Atlas connection string and IP whitelist
3. **Image pull errors**: Ensure ECR repositories exist and images are pushed

### Useful Commands
```bash
# Check service status
aws ecs describe-services --cluster attendance-cluster --services attendance-service

# View task logs
aws logs get-log-events --log-group-name /ecs/attendance-management --log-stream-name backend/backend/TASK_ID

# Update service with new task definition
aws ecs update-service --cluster attendance-cluster --service attendance-service --task-definition attendance-management:REVISION
```

## Cost Optimization
- Use Fargate Spot for non-production environments
- Configure auto-scaling based on CPU/memory utilization
- Use Application Load Balancer for multiple availability zones

## Next Steps
1. Set up CI/CD pipeline for automated deployments
2. Configure domain name and SSL certificate
3. Set up monitoring and alerting
4. Implement backup strategy for MongoDB Atlas