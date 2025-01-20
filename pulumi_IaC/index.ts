import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const region = "ap-southeast-1";
const env = "todo-infra";
const cidrBlock = "10.10.0.0/16";

const publicSubnet1Cidr = "10.10.1.0/24";
const publicSubnet2Cidr = "10.10.2.0/24";

const privateSubnet1Cidr = "10.10.3.0/24";
const privateSubnet2Cidr = "10.10.4.0/24";
const privateSubnet3Cidr = "10.10.5.0/24";

//General overview
/*
- 1 vpc
- 2 public subnet
    - 1st subnet(public sn-1): for server to ssh into private subnet's ec2 instances, and client app
    - 2nd subnet: for alb
- 3 private subnet
    - 1st(private-sn-1): Node app 
    - 2nd private-sn-2: Node app 
    - 3rd(private-sn-3): MongoDB 
- 1 igw
- 1 public route table
- 1 private route table
- 4 ec2 instance
    - 1 for bastion server and client app (public sn-1) 
    - 2 for Node app (private-sn-1 and private-sn-2), 
    - 1 for MongoDB (private-sn-3)

- 4 security group
- 1 nat gateway
- 1 alb
- 1 target group
- 1 listener
- 1 key pair
- 1 asg
 

flow: 
- ssh form local host into bastion server
- from bastion ssh into private-sn-1,2 (app servers) and private-sn-3 (DB server)
- app servers only receive traffic from alb
- db only entertain app server cidr
- for scalability - asg for auto scaling that is attached to the alb
- and all other networking association
*/

//----------------------Start of the script----------------------//
// VPC
const vpc = new aws.ec2.Vpc(`${env}-vpc`, {
  cidrBlock: cidrBlock,
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { Name: `${env}-vpc` },
});

// Public subnets in two AZs
const publicSubnet1 = new aws.ec2.Subnet(`${env}-public-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `${env}-public-sn-1` },
});

const publicSubnet2 = new aws.ec2.Subnet(`${env}-public-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `${env}-public-sn-2` },
});

// Private subnets in three AZs. First two private subnets are for Node apps, and the 3rd one is for the Mongo DB.
const privateSubnet1 = new aws.ec2.Subnet(`${env}-private-app-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-app-sn-1` },
});

const privateSubnet2 = new aws.ec2.Subnet(`${env}-private-app-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-app-sn-2` },
});

// Private subnet for Mongo DB
const privateSubnetForDb = new aws.ec2.Subnet(`${env}-private-db-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet3Cidr,
  availabilityZone: `${region}c`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-db-sn-1` },
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway(`${env}-igw`, {
  vpcId: vpc.id,
  tags: { Name: `${env}-igw` },
});

// Public Route Table and Association
const publicRouteTable = new aws.ec2.RouteTable(`${env}-public-rt-1`, {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { Name: `${env}-public-rt-1` },
});

new aws.ec2.RouteTableAssociation(`${env}-public-rt-association-1`, {
  subnetId: publicSubnet1.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-public-rt-association-2`, {
  subnetId: publicSubnet2.id,
  routeTableId: publicRouteTable.id,
});

// Private Route Table
const privateRouteTable = new aws.ec2.RouteTable(`${env}-private-rt-1`, {
  vpcId: vpc.id,
  tags: { Name: `${env}-private-rt-1` },
});

// NAT Gateway
const eip = new aws.ec2.Eip(`${env}-nat-eip`, { vpc: true });

const natGateway = new aws.ec2.NatGateway(`${env}-nat-gateway`, {
  allocationId: eip.id,
  subnetId: publicSubnet1.id,
  tags: { Name: `${env}-nat-gateway` },
});

// Ensure the route creation references the NAT Gateway correctly
const privateRoute = new aws.ec2.Route(`${env}-private-route-to-nat`, {
  routeTableId: privateRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  natGatewayId: natGateway.id,
});

// Route Table Associations for Node App and DB subnets
new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-1`, {
  subnetId: privateSubnet1.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-2`, {
  subnetId: privateSubnet2.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-3`, {
  subnetId: privateSubnetForDb.id,
  routeTableId: privateRouteTable.id,
});

/*
sg: security group
public sg to access bastion server public sg.
as we want to ssh from local machine to bastion server, allowing dynamic ip as this would be attached to the public subnet 1
where the bastion server is located
*/
const publicSnSecurityGroup = new aws.ec2.SecurityGroup(`${env}-public-sn-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"],
    },
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
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
    Name: `${env}-public-sn-sg`,
  },
});

// ALB Security Group
const albSecurityGroup = new aws.ec2.SecurityGroup(`${env}-alb-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
    },
    {
      protocol: "tcp",
      fromPort: 443,
      toPort: 443,
      cidrBlocks: ["0.0.0.0/0"],
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
    Name: `${env}-alb-sg`,
  },
});

// Application Security Group for node App
const appSecurityGroup = new aws.ec2.SecurityGroup(`${env}-app-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5000,
      toPort: 5000,
      securityGroups: [albSecurityGroup.id],
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
    Name: `${env}-app-sg`,
  },
});

// DB security group
const dbSecurityGroup = new aws.ec2.SecurityGroup(`${env}-db-sg`, {
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
      cidrBlocks: [publicSubnet1Cidr], // Only from public subnet 1 CIDR, i.e., the Bastion server can SSH
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
    Name: `${env}-db-sg`,
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

// First create MongoDB instance
const mongodbInstance1 = new aws.ec2.Instance(`${env}-mongo-instance-1`, {
  instanceType: "t2.micro",
  ami: ubuntuAmi.id,
  subnetId: privateSubnetForDb.id,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: `#!/bin/bash
    set -o errexit
    set -o nounset
    apt-get update -y
    apt-get install -y mongodb
    systemctl enable mongodb
    systemctl start mongodb
    systemctl status mongodb > /home/ubuntu/mongo_status.log
    echo "MongoDB setup complete and running on the instance" > /home/ubuntu/setup.log
  `,
  tags: {
    Name: `${env}-mongo-instance-1`,
  },
});

// Then create Node instances that depend on MongoDB
const nodeInstance1 = new aws.ec2.Instance(`${env}-node-instance-1`, {
  instanceType: "t2.micro",
  ami: ubuntuAmi.id,
  subnetId: privateSubnet1.id,
  vpcSecurityGroupIds: [appSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: pulumi.interpolate`#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y docker.io mongodb-clients
systemctl enable docker
systemctl start docker
docker pull bayajid23/simply-done-server:latest
docker run -d \
  --name simply-done-server \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://${mongodbInstance1.privateIp}:27017/simplyDone" \
  -e NODE_ENV=production \
  bayajid23/simply-done-server:latest
echo "Backend instance setup completed" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-node-instance-1`,
  },
});

const nodeInstance2 = new aws.ec2.Instance(`${env}-node-instance-2`, {
  instanceType: "t2.micro",
  ami: ubuntuAmi.id,
  subnetId: privateSubnet2.id,
  vpcSecurityGroupIds: [appSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: pulumi.interpolate`#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y docker.io mongodb-clients
systemctl enable docker
systemctl start docker
docker pull bayajid23/simply-done-server:latest
docker run -d \
  --name simply-done-server \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://${mongodbInstance1.privateIp}:27017/simplyDone" \
  -e NODE_ENV=production \
  bayajid23/simply-done-server:latest
echo "Backend instance setup completed" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-node-instance-2`,
  },
});

// ALB Target Group
const targetGroup = new aws.lb.TargetGroup(`${env}-tg`, {
  port: 5000,
  protocol: "HTTP",
  vpcId: vpc.id,
  targetType: "instance",
  healthCheck: {
    path: "/health",
    interval: 30,
    timeout: 20,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    matcher: "200",
  },
  tags: {
    Name: `${env}-tg`,
  },
});

// Attach EC2 instances to ALB target group
const instanceTgAttachment1 = new aws.lb.TargetGroupAttachment(
  `${env}-instance-tg-attachment-1`,
  {
    targetGroupArn: targetGroup.arn,
    targetId: nodeInstance1.id,
    port: 5000,
  }
);

const instanceTgAttachment2 = new aws.lb.TargetGroupAttachment(
  `${env}-instance-tg-attachment-2`,
  {
    targetGroupArn: targetGroup.arn,
    targetId: nodeInstance2.id,
    port: 5000,
  }
);

// ALB
const alb = new aws.lb.LoadBalancer(`${env}-alb`, {
  internal: false,
  securityGroups: [albSecurityGroup.id],
  subnets: [publicSubnet1.id, publicSubnet2.id],
  enableDeletionProtection: false,
  tags: {
    Name: `${env}-alb`,
  },
});

// ALB Listener
const listener = new aws.lb.Listener(`${env}-alb-listener`, {
  loadBalancerArn: alb.arn,
  port: 80,
  protocol: "HTTP",
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: targetGroup.arn,
    },
  ],
  tags: {
    Name: `${env}-listener`,
  },
});

// const MONGODB_URI = "mongodb://user:example@10.10.5.10:27017/todoApp";

const userData = `#!/bin/bash
set -e
set -x

# Update and install essential packages
sudo apt-get update -y
sudo apt-get install -y docker.io awscli

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Get MongoDB connection string from SSM Parameter Store (you'll need to create this parameter)
MONGODB_URI=$(aws ssm get-parameter --name "/simply-done/mongodb-uri" --with-decryption --region ${region} --query "Parameter.Value" --output text)

# Run the Node.js app container
docker run -d \
  --name simply-done-server \
  -p 5000:5000 \
  -e MONGODB_URI="$MONGODB_URI" \
  -e NODE_ENV=production \
  -e ACCESS_TOKEN_SECRET=mySecret \
  -e ACCESS_TOKEN_EXPIRES_IN=12h \
  bayajid23/simply-done-server:latest

# Add logging
echo "Container started at $(date)" >> /var/log/simply-done.log
`;

// Launch Template for ASG
const launchTemplate = new aws.ec2.LaunchTemplate(`${env}-node-app-lt`, {
  name: `${env}-node-app-lt`,
  imageId: ubuntuAmi.id,
  instanceType: "t2.micro",
  keyName: keyPair.keyName,
  userData: pulumi.interpolate`#!/bin/bash
set -e
set -x

# Update and install essential packages
sudo apt-get update -y
sudo apt-get install -y docker.io awscli

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Get sensitive data from Parameter Store
MONGODB_URI=$(aws ssm get-parameter --name "/${env}/mongodb-uri" --with-decryption --region ${region} --query "Parameter.Value" --output text)
ACCESS_TOKEN_SECRET=$(aws ssm get-parameter --name "/${env}/access-token-secret" --with-decryption --region ${region} --query "Parameter.Value" --output text)

# Run the Node.js app container
docker run -d \
  --name simply-done-server \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://${mongodbInstance1.privateIp}:27017/simplyDone" \
  -e NODE_ENV=production \
  -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
  -e ACCESS_TOKEN_EXPIRES_IN=12h \
  bayajid23/simply-done-server:latest

# Add logging
echo "Container started at $(date)" >> /var/log/simply-done.log
`.apply((userData) => Buffer.from(userData).toString("base64")),
  networkInterfaces: [
    {
      associatePublicIpAddress: "false",
      securityGroups: [appSecurityGroup.id],
      deleteOnTermination: "true",
    },
  ],
  monitoring: {
    enabled: true,
  },
  tags: {
    Name: `${env}-node-app-instance`,
    Environment: env,
  },
});

// Auto Scaling Group
const asg = new aws.autoscaling.Group(`${env}-node-app-asg`, {
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
      value: `${env}-node-app-instance`,
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
const scaleUpPolicy = new aws.autoscaling.Policy(`${env}-node-asg-scale-up`, {
  scalingAdjustment: 1,
  adjustmentType: "ChangeInCapacity",
  cooldown: 300,
  autoscalingGroupName: asg.name,
});

const scaleDownPolicy = new aws.autoscaling.Policy(
  `${env}-node-asg-scale-down`,
  {
    scalingAdjustment: -1,
    adjustmentType: "ChangeInCapacity",
    cooldown: 300,
    autoscalingGroupName: asg.name,
  }
);

// Add CloudWatch Alarms for Auto Scaling
const highCpuAlarm = new aws.cloudwatch.MetricAlarm(`${env}-high-cpu-alarm`, {
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 2,
  metricName: "CPUUtilization",
  namespace: "AWS/EC2",
  period: 300,
  statistic: "Average",
  threshold: 70,
  alarmDescription: "Scale up when CPU > 70%",
  dimensions: {
    AutoScalingGroupName: asg.name,
  },
  alarmActions: [scaleUpPolicy.arn],
});

const lowCpuAlarm = new aws.cloudwatch.MetricAlarm(`${env}-low-cpu-alarm`, {
  comparisonOperator: "LessThanThreshold",
  evaluationPeriods: 2,
  metricName: "CPUUtilization",
  namespace: "AWS/EC2",
  period: 300,
  statistic: "Average",
  threshold: 30,
  alarmDescription: "Scale down when CPU < 30%",
  dimensions: {
    AutoScalingGroupName: asg.name,
  },
  alarmActions: [scaleDownPolicy.arn],
});

// Add Target Tracking Scaling Policy
const targetTrackingPolicy = new aws.autoscaling.Policy(
  `${env}-target-tracking-policy`,
  {
    autoscalingGroupName: asg.name,
    policyType: "TargetTrackingScaling",
    targetTrackingConfiguration: {
      predefinedMetricSpecification: {
        predefinedMetricType: "ASGAverageCPUUtilization",
      },
      targetValue: 50.0,
    },
  }
);

// Export resources
export const vpcId = vpc.id;
export const publicSubnet1Id = publicSubnet1.id;
export const publicSubnet2Id = publicSubnet2.id;

//networking
export const igwId = igw.id;
export const publicRouteTableId = publicRouteTable.id;

//ec2
export const nodeInstance1Id = nodeInstance1.id;
export const nodeInstance2Id = nodeInstance2.id;

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

//----------------------End of the script----------------------//
