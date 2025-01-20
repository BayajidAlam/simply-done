#!/bin/bash

# Set the region and VPC ID
REGION="ap-southeast-1"
VPC_ID="vpc-068b82124942a69ff"
INTERNET_GATEWAY_ID="igw-00b3510225024fd73"
SUBNET_IDS=("subnet-0aeea38a5b2eca5ad" "subnet-031a57ee9f14138f0")
ROUTE_TABLE_ID="rtb-094878b47890988ea"

echo "Starting forceful resource deletion in region $REGION for VPC $VPC_ID..."

# Step 1: Release Elastic IPs
echo "Releasing Elastic IPs..."
ALLOCATION_IDS=$(aws ec2 describe-addresses --query 'Addresses[*].AllocationId' --output text --region $REGION)
for ALLOCATION_ID in $ALLOCATION_IDS; do
  echo "Releasing Elastic IP: $ALLOCATION_ID..."
  aws ec2 release-address --allocation-id $ALLOCATION_ID --region $REGION || echo "Failed to release Elastic IP: $ALLOCATION_ID"
done

# Step 2: Delete Load Balancers and Target Groups
echo "Deleting Load Balancers..."
LOAD_BALANCER_ARNS=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[*].LoadBalancerArn' --output text --region $REGION)
for LB_ARN in $LOAD_BALANCER_ARNS; do
  echo "Deleting Load Balancer: $LB_ARN..."
  aws elbv2 delete-load-balancer --load-balancer-arn $LB_ARN --region $REGION || echo "Failed to delete Load Balancer: $LB_ARN"
done

echo "Deleting Target Groups..."
TARGET_GROUP_ARNS=$(aws elbv2 describe-target-groups --query 'TargetGroups[*].TargetGroupArn' --output text --region $REGION)
for TG_ARN in $TARGET_GROUP_ARNS; do
  echo "Deleting Target Group: $TG_ARN..."
  aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $REGION || echo "Failed to delete Target Group: $TG_ARN"
done

# Step 3: Detach and Delete Network Interfaces
echo "Deleting network interfaces..."
NETWORK_INTERFACE_IDS=$(aws ec2 describe-network-interfaces --filters Name=vpc-id,Values=$VPC_ID --query 'NetworkInterfaces[*].NetworkInterfaceId' --output text --region $REGION)
for NETWORK_INTERFACE_ID in $NETWORK_INTERFACE_IDS; do
  ATTACHMENT_ID=$(aws ec2 describe-network-interfaces --network-interface-ids $NETWORK_INTERFACE_ID --query 'NetworkInterfaces[0].Attachment.AttachmentId' --output text --region $REGION)
  if [ "$ATTACHMENT_ID" != "None" ]; then
    echo "Detaching Network Interface: $NETWORK_INTERFACE_ID..."
    aws ec2 detach-network-interface --attachment-id $ATTACHMENT_ID --region $REGION || echo "Failed to detach Network Interface: $NETWORK_INTERFACE_ID"
  fi
  echo "Deleting Network Interface: $NETWORK_INTERFACE_ID..."
  aws ec2 delete-network-interface --network-interface-id $NETWORK_INTERFACE_ID --region $REGION || echo "Failed to delete Network Interface: $NETWORK_INTERFACE_ID"
done

# Step 4: Detach and delete the Internet Gateway
echo "Detaching Internet Gateway $INTERNET_GATEWAY_ID..."
aws ec2 detach-internet-gateway --internet-gateway-id $INTERNET_GATEWAY_ID --vpc-id $VPC_ID --region $REGION || echo "Failed to detach Internet Gateway."

echo "Deleting Internet Gateway $INTERNET_GATEWAY_ID..."
aws ec2 delete-internet-gateway --internet-gateway-id $INTERNET_GATEWAY_ID --region $REGION || echo "Failed to delete Internet Gateway."

# Step 5: Delete subnets
echo "Deleting subnets..."
for SUBNET_ID in "${SUBNET_IDS[@]}"; do
  # Check if the subnet exists before deletion
  SUBNET_EXISTS=$(aws ec2 describe-subnets --subnet-ids $SUBNET_ID --query 'Subnets[0].SubnetId' --output text --region $REGION)
  if [ "$SUBNET_EXISTS" != "None" ]; then
    echo "Deleting Subnet: $SUBNET_ID..."
    aws ec2 delete-subnet --subnet-id $SUBNET_ID --region $REGION || echo "Failed to delete subnet: $SUBNET_ID"
  else
    echo "Subnet $SUBNET_ID does not exist or has already been deleted."
  fi
done

# Step 6: Delete route table
echo "Deleting route table $ROUTE_TABLE_ID..."
aws ec2 delete-route-table --route-table-id $ROUTE_TABLE_ID --region $REGION || echo "Failed to delete route table: $ROUTE_TABLE_ID"

# Step 7: Delete the VPC
echo "Deleting VPC $VPC_ID..."
aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION || echo "Failed to delete VPC: $VPC_ID"

echo "Forceful resource deletion process completed."
