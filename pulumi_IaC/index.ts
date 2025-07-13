import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { updateInventory } from "./scripts/updateHosts";

const region = "ap-southeast-1";
const cidrBlock = "10.10.0.0/16";
const env = "todo";

const publicSubnet1Cidr = "10.10.1.0/24";
const publicSubnet2Cidr = "10.10.2.0/24";

const privateSubnet1Cidr = "10.10.3.0/24";
const privateSubnet2Cidr = "10.10.4.0/24";
const privateSubnet3Cidr = "10.10.5.0/24";

//----------------------Start of the script----------------------//
// VPC
const vpc = new aws.ec2.Vpc(`vpc`, {
  cidrBlock: cidrBlock,
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { Name: `vpc` },
});

// Public subnets in two AZs
const publicSubnet1 = new aws.ec2.Subnet(`public-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `public-sn-1` },
});

const publicSubnet2 = new aws.ec2.Subnet(`public-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `public-sn-2` },
});

// Private subnets in three AZs. First two private subnets are for Node apps, and the 3rd one is for the Mongo DB.
const privateSubnet1 = new aws.ec2.Subnet(`private-app-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `private-app-sn-1` },
});

const privateSubnet2 = new aws.ec2.Subnet(`private-app-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `private-app-sn-2` },
});

// Private subnet for Mongo DB
const privateSubnetForDb = new aws.ec2.Subnet(`private-db-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet3Cidr,
  availabilityZone: `${region}c`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `private-db-sn-1` },
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway(`igw`, {
  vpcId: vpc.id,
  tags: { Name: `igw` },
});

// Public Route Table and Association
const publicRouteTable = new aws.ec2.RouteTable(`public-rt-1`, {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { Name: `public-rt-1` },
});

new aws.ec2.RouteTableAssociation(`public-rt-association-1`, {
  subnetId: publicSubnet1.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`public-rt-association-2`, {
  subnetId: publicSubnet2.id,
  routeTableId: publicRouteTable.id,
});

// Private Route Table
const privateRouteTable = new aws.ec2.RouteTable(`private-rt-1`, {
  vpcId: vpc.id,
  tags: { Name: `private-rt-1` },
});

// NAT Gateway
const eip = new aws.ec2.Eip(`nat-eip`, { vpc: true });

const natGateway = new aws.ec2.NatGateway(`nat-gateway`, {
  allocationId: eip.id,
  subnetId: publicSubnet1.id,
  tags: { Name: `nat-gateway` },
});

// Ensure the route creation references the NAT Gateway correctly
const privateRoute = new aws.ec2.Route(`private-route-to-nat`, {
  routeTableId: privateRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  natGatewayId: natGateway.id,
});

// Route Table Associations for Node App and DB subnets
new aws.ec2.RouteTableAssociation(`private-rt-association-1`, {
  subnetId: privateSubnet1.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`private-rt-association-2`, {
  subnetId: privateSubnet2.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`private-rt-association-3`, {
  subnetId: privateSubnetForDb.id,
  routeTableId: privateRouteTable.id,
});

/*
sg: security group
public sg to access bastion server public sg.
*/
const publicSnSecurityGroup = new aws.ec2.SecurityGroup(`public-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow SSH",
    },
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow HTTP",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `public-sg`,
  },
});

// Security group for bastion host
const bastionSecurityGroup = new aws.ec2.SecurityGroup(`bastion-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow SSH from anywhere",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `bastion-sg`,
  },
});

// Security group for ALB
const albSecurityGroup = new aws.ec2.SecurityGroup(`alb-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow HTTP",
    },
    {
      protocol: "tcp",
      fromPort: 443,
      toPort: 443,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow HTTPS",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `alb-sg`,
  },
});

// Security group for application (backend)
const appSecurityGroup = new aws.ec2.SecurityGroup(`app-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5000,
      toPort: 5000,
      securityGroups: [albSecurityGroup.id],
      description: "Allow traffic from ALB",
    },
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [publicSubnet1Cidr],
      description: "Allow SSH from bastion",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `${env}-app-sg`,
  },
});

// DB security group
const dbSecurityGroup = new aws.ec2.SecurityGroup(`db-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 27017,
      toPort: 27017,
      securityGroups: [appSecurityGroup.id],
    },
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [publicSubnet1Cidr],
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `db-sg`,
  },
});

// Fetch the latest Ubuntu AMI for the EC2 instances
const ubuntuAmi = pulumi.output(
  aws.ec2.getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [
      {
        name: "name",
        values: ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"],
      },
    ],
  })
);

// Use existing key pair instead of creating a new one
const keyPair = aws.ec2.KeyPair.get("existing-key", "MyKeyPair");

// Frontend Security Group
const frontendSecurityGroup = new aws.ec2.SecurityGroup(`frontend-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow HTTP",
    },
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow SSH",
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `frontend-sg`,
  },
});

// ALB Configuration
const alb = new aws.lb.LoadBalancer(`alb`, {
  internal: false,
  securityGroups: [albSecurityGroup.id],
  subnets: [publicSubnet1.id, publicSubnet2.id],
  enableDeletionProtection: false,
  tags: {
    Name: `alb`,
  },
});

// Target Group
const targetGroup = new aws.lb.TargetGroup(`tg`, {
  port: 5000,
  protocol: "HTTP",
  vpcId: vpc.id,
  targetType: "instance",
  healthCheck: {
    path: "/health",
    port: "5000",
    protocol: "HTTP",
    interval: 30,
    timeout: 10,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    matcher: "200-299",
  },
  tags: {
    Name: `tg`,
  },
});

// ALB Listener
const listener = new aws.lb.Listener(`alb-listener`, {
  loadBalancerArn: alb.arn,
  port: 80,
  protocol: "HTTP",
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: targetGroup.arn,
    },
  ],
});

// Bastion Instance
const bastionInstance = new aws.ec2.Instance(`bastion-instance`, {
  ami: ubuntuAmi.id,
  instanceType: "t2.micro",
  subnetId: publicSubnet1.id,
  vpcSecurityGroupIds: [bastionSecurityGroup.id],
  keyName: keyPair.keyName,
  associatePublicIpAddress: true,
  userData: pulumi.interpolate`#!/bin/bash
        set -e
        set -x

        # Update and install Ansible
        sudo apt-get update
        sudo apt-get install -y software-properties-common
        sudo add-apt-repository --yes --update ppa:ansible/ansible
        sudo apt-get install -y ansible
    `.apply((script) => Buffer.from(script).toString("base64")),
  tags: {
    Name: `bastion-instance`,
  },
});

// Frontend Instance
const frontendInstance = new aws.ec2.Instance(`frontend-instance`, {
  ami: ubuntuAmi.id,
  instanceType: "t2.micro",
  subnetId: publicSubnet1.id,
  vpcSecurityGroupIds: [frontendSecurityGroup.id],
  keyName: keyPair.keyName,
  associatePublicIpAddress: true,
  userData: pulumi.interpolate`#!/bin/bash
        set -e
        set -x

        # Update and install Ansible
        sudo apt-get update
        sudo apt-get install -y software-properties-common
        sudo add-apt-repository --yes --update ppa:ansible/ansible
        sudo apt-get install -y ansible
    `.apply((script) => Buffer.from(script).toString("base64")),
  tags: {
    Name: `frontend-instance`,
  },
});

// MongoDB instance
const mongodbInstance = new aws.ec2.Instance("mongo-instance", {
  instanceType: "t2.micro",
  ami: ubuntuAmi.id,
  subnetId: privateSubnetForDb.id,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  keyName: keyPair.keyName,
  tags: {
    Name: "mongo-instance",
  },
});

// Launch Template for Auto Scaling Group
const launchTemplate = new aws.ec2.LaunchTemplate(
  "app-launch-template",
  {
    namePrefix: "app-template",
    imageId: ubuntuAmi.id,
    instanceType: "t2.micro",
    keyName: keyPair.keyName,
    userData: pulumi.interpolate`#!/bin/bash
        set -e
        set -x

        # Install Docker
        apt-get update
        apt-get install -y docker.io netcat
        systemctl start docker
        systemctl enable docker

        # Wait for MongoDB
        while ! nc -z ${mongodbInstance.privateIp} 27017; do
          echo "Waiting for MongoDB..."
          sleep 10
        done

        # Run backend container
        docker run -d \
          --name simply-done-server \
          --restart always \
          -p 5000:5000 \
          -e MONGODB_URI="mongodb://${mongodbInstance.privateIp}:27017/simplyDone" \
          -e NODE_ENV="production" \
          -e ACCESS_TOKEN_SECRET="esddd" \
          -e ACCESS_TOKEN_EXPIRES_IN="1d" \
          bayajid23/simply-done-server:latest
    `.apply((script) => Buffer.from(script).toString("base64")),
    networkInterfaces: [
      {
        associatePublicIpAddress: "false",
        securityGroups: [appSecurityGroup.id],
        deleteOnTermination: "true",
      },
    ],
    tags: {
      Name: "app-launch-template",
    },
  },
  { dependsOn: [mongodbInstance] }
);

// Auto Scaling Group
const asg = new aws.autoscaling.Group(`node-app-asg`, {
  vpcZoneIdentifiers: [privateSubnet1.id, privateSubnet2.id],
  targetGroupArns: [targetGroup.arn],
  healthCheckType: "ELB",
  healthCheckGracePeriod: 300,
  desiredCapacity: 2,
  minSize: 1,
  maxSize: 5,
  launchTemplate: {
    id: launchTemplate.id,
    version: "$Latest",
  },
  tags: [
    {
      key: "Name",
      value: `scaled-node-instance`,
      propagateAtLaunch: true,
    },
    {
      key: "Environment",
      value: env,
      propagateAtLaunch: true,
    },
  ],
});

// Scaling Policies for ASG
const scaleUpPolicy = new aws.autoscaling.Policy(`node-asg-scale-up`, {
  scalingAdjustment: 1,
  adjustmentType: "ChangeInCapacity",
  cooldown: 300,
  autoscalingGroupName: asg.name,
});

const scaleDownPolicy = new aws.autoscaling.Policy(`node-asg-scale-down`, {
  scalingAdjustment: -1,
  adjustmentType: "ChangeInCapacity",
  cooldown: 300,
  autoscalingGroupName: asg.name,
});

// Add CloudWatch Alarms for Auto Scaling
const highCpuAlarm = new aws.cloudwatch.MetricAlarm(`high-cpu-alarm`, {
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 2,
  metricName: "CPUUtilization",
  namespace: "AWS/EC2",
  period: 120,
  statistic: "Average",
  threshold: 80,
  alarmDescription: "This metric monitors ec2 cpu utilization",
  alarmActions: [scaleUpPolicy.arn],
  dimensions: {
    AutoScalingGroupName: asg.name,
  },
});

const lowCpuAlarm = new aws.cloudwatch.MetricAlarm(`low-cpu-alarm`, {
  comparisonOperator: "LessThanThreshold",
  evaluationPeriods: 2,
  metricName: "CPUUtilization",
  namespace: "AWS/EC2",
  period: 120,
  statistic: "Average",
  threshold: 10,
  alarmDescription: "This metric monitors ec2 cpu utilization",
  alarmActions: [scaleDownPolicy.arn],
  dimensions: {
    AutoScalingGroupName: asg.name,
  },
});

// EXPORTS
//vpc
export const vpcId = vpc.id;

//subnets
export const publicSubnet1Id = publicSubnet1.id;
export const publicSubnet2Id = publicSubnet2.id;
export const privateSubnet1Id = privateSubnet1.id;
export const privateSubnet2Id = privateSubnet2.id;
export const privateSubnetForDbId = privateSubnetForDb.id;

//route tables
export const publicRouteTableId = publicRouteTable.id;
export const privateRouteTableId = privateRouteTable.id;

//nat gateway and eip
export const natGatewayId = natGateway.id;
export const eipId = eip.id;

//alb
export const targetGroupId = targetGroup.id;
export const albId = alb.id;
export const albDnsName = alb.dnsName;
export const listenerId = listener.id;

//asg
export const asgName = asg.name;
export const asgArn = asg.arn;
export const asgId = asg.id;
export const asgLaunchTemplateId = launchTemplate.id;

// Export security group IDs
export const publicSnSecurityGroupId = publicSnSecurityGroup.id;
export const albSecurityGroupId = albSecurityGroup.id;
export const appSecurityGroupId = appSecurityGroup.id;
export const dbSecurityGroupId = dbSecurityGroup.id;
export const bastionSecurityGroupId = bastionSecurityGroup.id;
export const frontendSecurityGroupId = frontendSecurityGroup.id;

// Export EC2 instance IDs
export const bastionInstanceId = bastionInstance.id;
export const mongodbInstanceId = mongodbInstance.id;
export const frontendInstanceId = frontendInstance.id;

// Export IP addresses
export const bastionInstancePublicIp = bastionInstance.publicIp;
export const mongodbInstancePrivateIp = mongodbInstance.privateIp;
export const frontendInstancePublicIp = frontendInstance.publicIp;

// Export your outputs
export const outputs = {
  albDnsName: alb.dnsName,
  frontendPublicIp: frontendInstance.publicIp,
};

// Create a local stack reference
const stack = new pulumi.StackReference("BayajidAlam/simply-done/simply-dev");

// Update the Ansible inventory when the stack is updated
pulumi
  .all([
    alb.dnsName,
    frontendInstance.publicIp,
    mongodbInstance.privateIp,
    bastionInstance.publicIp,
  ])
  .apply(([albDns, frontendIp, mongoIp, bastionIp]) => {
    updateInventory({
      albDnsName: albDns,
      frontendPublicIp: frontendIp,
      mongodbPrivateIp: mongoIp,
      bastionPublicIp: bastionIp,
    });
  });

//----------------------End of the script----------------------//