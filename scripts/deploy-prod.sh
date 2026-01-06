#!/bin/bash
set -e

# 1. Load production environment variables
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

echo "🚀 Preparing production deployment..."

# 2. Backup original schema
cp prisma/schema.prisma prisma/schema.prisma.bak

# 3. Swap provider to PostgreSQL for the migration
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

echo "📑 Pushing schema changes to RDS..."
# Push schema state to production DB (works across providers)
npx prisma db push --accept-data-loss

echo "🔄 Syncing data from local SQLite to RDS..."
# Run the data sync script
npx tsx scripts/sync-data-to-prod.ts

echo "☁️  Deploying to AWS with SST..."
# 4. Run SST deploy (this will trigger next build using the postgres provider)
npm run deploy

# 5. Restore original schema for local development
mv prisma/schema.prisma.bak prisma/schema.prisma

echo "✅ Production deployment and sync complete!"
