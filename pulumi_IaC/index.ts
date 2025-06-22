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
as we want to ssh from local machine to bastion server, allowing dynamic ip as this would be attached to the public subnet 1
where the bastion server is located
*/
const publicSnSecurityGroup = new aws.ec2.SecurityGroup(`public-sn-sg`, {
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
    Name: `public-sn-sg`,
  },
});

// ALB Security Group
const albSecurityGroup = new aws.ec2.SecurityGroup(`alb-sg`, {
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
    Name: `alb-sg`,
  },
});

// Bastion Security Group
const bastionSecurityGroup = new aws.ec2.SecurityGroup(`${env}-bastion-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
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
    Name: `${env}-bastion-sg`,
  },
});

// Application Security Group for Node App
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
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  egress: [
    {
      protocol: "tcp",
      fromPort: 27017,
      toPort: 27017,
      cidrBlocks: [
        privateSubnetForDb.cidrBlock.apply((cidr: any) => cidr || "0.0.0.0/0"),
      ],
    },
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

// ALB Configuration (Move this BEFORE frontend instance)
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

// Frontend Instance (Move this AFTER alb)
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

// Define your MongoDB instance
const mongodbInstance = new aws.ec2.Instance("mongo-instance", {
  instanceType: "t2.micro",
  ami: ubuntuAmi.id,
  subnetId: privateSubnet1.id,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  keyName: keyPair.keyName,
  tags: {
    Name: "mongo-instance",
  },
});

// Define your backend instances
const backendInstances = [];
for (let i = 1; i <= 2; i++) {
  const backendInstance = new aws.ec2.Instance(`node-instance-${i}`, {
    instanceType: "t2.micro",
    ami: ubuntuAmi.id,
    subnetId: privateSubnet1.id,
    vpcSecurityGroupIds: [appSecurityGroup.id],
    keyName: keyPair.keyName,
    tags: {
      Name: `node-instance-${i}`,
    },
  });
  backendInstances.push(backendInstance);
}

// Export the private IPs for use in Ansible
export const mongodbPrivateIp = mongodbInstance.privateIp;
export const backendPrivateIps = backendInstances.map(
  (instance) => instance.privateIp
);

// Launch Template for Auto Scaling Group
const launchTemplate = new aws.ec2.LaunchTemplate(
  "app-launch-template",
  {
    namePrefix: "app-template",
    imageId: ubuntuAmi.id,
    instanceType: "t2.micro",
    keyName: keyPair.keyName,
    userData: pulumi.interpolate`
        #!/bin/bash
        set -e
        set -x

        # Update and install Ansible
        apt-get update
        apt-get install -y software-properties-common
        add-apt-repository --yes --update ppa:ansible/ansible
        apt-get install -y ansible git

        # Clone your Ansible playbook repository
        git clone https://github.com/BayajidAlam/simply-done.git /opt/ansible-playbooks

        # Run the Ansible playbook
        ansible-playbook /opt/ansible-playbooks/pulumi_IaC/ansible/provision_backend.yml -i /opt/ansible-playbooks/pulumi_IaC/ansible/inventory/hosts.yml
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
  period: 300,
  statistic: "Average",
  threshold: 70,
  alarmDescription: "Scale up when CPU > 70%",
  dimensions: {
    AutoScalingGroupName: asg.name,
  },
  alarmActions: [scaleUpPolicy.arn],
});

const lowCpuAlarm = new aws.cloudwatch.MetricAlarm(`low-cpu-alarm`, {
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
  `target-tracking-policy`,
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

// Bastion EC2 Instance
const bastionInstance = new aws.ec2.Instance(`${env}-bastion-instance`, {
  ami: ubuntuAmi.id, // Use the appropriate AMI
  instanceType: "t2.micro",
  subnetId: publicSubnet1.id, // Use a public subnet
  vpcSecurityGroupIds: [bastionSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: pulumi.interpolate`#!/bin/bash
    set -e
    set -x

    # Update and install necessary packages
    sudo apt-get update -y
    sudo apt-get install -y awscli
  `,
  tags: {
    Name: `${env}-bastion-instance`,
  },
});

// Export resources
export const vpcId = vpc.id;
export const publicSubnet1Id = publicSubnet1.id;
export const publicSubnet2Id = publicSubnet2.id;
export const privateSubnet1Id = privateSubnet1.id;
export const privateSubnet2Id = privateSubnet2.id;
export const privateSubnetForDbId = privateSubnetForDb.id;

//networking
export const igwId = igw.id;
export const publicRouteTableId = publicRouteTable.id;
export const privateRouteTableId = privateRouteTable.id;

//ec2
export const nodeInstance1Id = backendInstances[0].id;
export const nodeInstance2Id = backendInstances[1].id;

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

// Export IP addresses (if applicable)
export const bastionInstancePublicIp = bastionInstance.publicIp;
export const nodeInstance1PrivateIp = backendInstances[0].privateIp;
export const nodeInstance2PrivateIp = backendInstances[1].privateIp;
export const mongodbInstancePrivateIp = mongodbInstance.privateIp;
export const frontendInstancePublicIp = frontendInstance.publicIp;

// Add this to your exports
export const frontendPublicIp = frontendInstance.publicIp;

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
    mongodbPrivateIp,
    backendPrivateIps,
    bastionInstance.publicIp,
  ])
  .apply(([albDns, frontendIp, mongoIp, backendIps, bastionIp]) => {
    updateInventory({
      albDnsName: albDns,
      frontendPublicIp: frontendIp,
      mongodbPrivateIp: mongoIp,
      backendPrivateIps: backendIps,
      bastionPublicIp: bastionIp,
    });
  });

//----------------------End of the script----------------------//
