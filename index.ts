import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

// Look up the latest Amazon Linux 2 AMI.
const ami = aws.ec2
  .getAmi({
    filters: [
      {
        name: 'name',
        values: ['amzn2-ami-hvm-*'],
      },
    ],
    owners: ['amazon'],
    mostRecent: true,
  })
  .then((invoke) => invoke.id);

// User data to start a HTTP server in the EC2 instance
const userData = `#!/bin/bash
echo "Hello, World from Pulumi!" > index.html
nohup python -m SimpleHTTPServer 80 &
`;

// Create a security group allowing inbound access over port 80 and outbound
// access to anywhere.
const secGroup = new aws.ec2.SecurityGroup('secGroup', {
  description: 'Enable HTTP access',
  ingress: [
    {
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
});

// Create and launch an EC2 instance into the public subnet.
const server = new aws.ec2.Instance('server', {
  instanceType: 't3.micro',
  vpcSecurityGroupIds: [secGroup.id],
  userData: userData,
  ami: ami,
  tags: {
    Name: 'webserver',
  },
});

// Export the instance's publicly accessible IP address and hostname.
export const ip = server.publicIp;
export const hostname = server.publicDns;
export const url = pulumi.interpolate`http://${server.publicDns}`;
