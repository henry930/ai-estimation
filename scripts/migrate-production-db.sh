#!/bin/bash

# Production Database Migration Script
# This script creates a new PostgreSQL migration and deploys it to production

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Production Database Migration                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using production database..."
    export DATABASE_URL="postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require"
fi

echo "📊 Database: $DATABASE_URL"
echo ""

# Step 1: Test connection
echo "🔍 Step 1: Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection successful!"
else
    echo "❌ Connection failed! Please check your DATABASE_URL"
    exit 1
fi
echo ""

# Step 2: Check migration status
echo "🔍 Step 2: Checking migration status..."
npx prisma migrate status || true
echo ""

# Step 3: Deploy migrations
echo "🚀 Step 3: Deploying migrations to production..."
echo "⚠️  This will apply all pending migrations to the production database."
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
    echo "✅ Migrations deployed successfully!"
else
    echo "❌ Migration cancelled by user"
    exit 1
fi
echo ""

# Step 4: Generate Prisma Client
echo "🔧 Step 4: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated!"
echo ""

# Step 5: Verify schema
echo "🔍 Step 5: Verifying database schema..."
npx tsx scripts/setup-production-db.ts --verify-only
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✅ Production database setup complete!                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
