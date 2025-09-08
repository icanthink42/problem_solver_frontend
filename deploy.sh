#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <ec2-ip-address>"
    exit 1
fi

EC2_IP=$1
EC2_USER="ec2-user"
DIST_PATH="dist/problem-solver"

echo "Building Angular app..."
ng build --configuration production --define BACKEND="'https://api.physics.neelema.net'"

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Creating dist directory on EC2..."
ssh ${EC2_USER}@${EC2_IP} "rm -rf ~/dist && mkdir -p ~/${DIST_PATH}"

echo "Copying build files to EC2..."
scp -r ${DIST_PATH}/* ${EC2_USER}@${EC2_IP}:~/${DIST_PATH}/

echo "Copying server scripts to EC2..."
scp start.sh server.py ${EC2_USER}@${EC2_IP}:~/

echo "Setting permissions..."
ssh ${EC2_USER}@${EC2_IP} "chmod +x ~/start.sh"

echo "Deployment complete!"
echo "To start the server, SSH into the EC2 instance and run: ./start.sh"