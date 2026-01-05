#!/bin/bash

# AWS RDS Database Setup Script
# This script creates an RDS PostgreSQL instance for the ai-estimation app

set -e

echo "Creating RDS PostgreSQL instance..."

# Configuration
DB_INSTANCE_ID="ai-estimation-db"
DB_NAME="ai_estimation"
DB_USERNAME="aiestimation"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REGION="eu-west-1"

echo "Database password (save this): $DB_PASSWORD"

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.15 \
    --master-username "$DB_USERNAME" \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --db-name "$DB_NAME" \
    --backup-retention-period 0 \
    --publicly-accessible \
    --region "$REGION" \
    --tags Key=Project,Value=ai-estimation Key=Environment,Value=production

echo "RDS instance creation initiated. This will take 5-10 minutes..."
echo "Waiting for instance to be available..."

# Wait for RDS to be available
aws rds wait db-instance-available \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION"

# Get the endpoint
ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --region "$REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo ""
echo "✅ RDS instance created successfully!"
echo ""
echo "Database Details:"
echo "  Endpoint: $ENDPOINT"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USERNAME"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Connection String:"
echo "  DATABASE_URL=\"postgresql://$DB_USERNAME:$DB_PASSWORD@$ENDPOINT:5432/$DB_NAME?sslmode=require\""
echo ""
echo "⚠️  IMPORTANT: Save the password above - it cannot be retrieved later!"
echo "⚠️  Update your .env.production file with the connection string above"
