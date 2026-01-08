#!/bin/bash
set -e

# 1. Load production environment variables
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

echo "🚀 Preparing production deployment..."

echo "📑 Pushing schema changes to RDS..."
# Push schema state to production DB (works across providers)
npx prisma db push --accept-data-loss

echo "☁️  Deploying to AWS with SST..."
# 4. Run SST deploy
npm run deploy

echo "✅ Production deployment complete!"
