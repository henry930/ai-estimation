#!/bin/bash
set -e

# 1. Load production environment variables
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

echo "🚀 Quick deploying to AWS (Skipping DB checks)..."

# 2. Swap provider to PostgreSQL (Temporary for build)
cp prisma/schema.prisma prisma/schema.prisma.bak
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

# 3. Regenerate client to ensure type safety
npx prisma generate

# 4. Run SST deploy
npm run deploy

# 5. Restore original schema
mv prisma/schema.prisma.bak prisma/schema.prisma

echo "✅ Quick deployment complete!"
