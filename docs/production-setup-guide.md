# Production Setup Guide

This guide walks through setting up the production environment for the AI Estimation application on AWS.

## Current Status

✅ **Completed:**
- Application deployed to AWS via SST
- RDS PostgreSQL database provisioned
- CloudFront distribution created
- Production URL: https://d3elwe2avy3lk3.cloudfront.net

❌ **Pending:**
- Production database schema initialization
- GitHub OAuth configuration for production domain
- Environment variables verification
- End-to-end testing in production

## Prerequisites

- AWS CLI configured with appropriate credentials
- Access to AWS RDS database
- GitHub account with OAuth app creation permissions
- Google API key for AI features

## Step 1: Production Database Initialization

### 1.1 Connect to Production Database

The production database is already provisioned:
- **Host**: `ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com`
- **Port**: `5432`
- **Database**: `ai_estimation`
- **Username**: `aiestimation`
- **Password**: `AiEstimation2026`

Connection string:
```
postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require
```

### 1.2 Run Prisma Migrations

To initialize the database schema:

```bash
# Set the production database URL
export DATABASE_URL="postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Verify the schema
npx prisma db pull
```

### 1.3 Verify Database Connection

Test the connection from the application:

```bash
# Run the database check script
npx tsx scripts/check-both-dbs.ts
```

## Step 2: GitHub OAuth Production Configuration

### 2.1 Create Production GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Estimation (Production)
   - **Homepage URL**: `https://d3elwe2avy3lk3.cloudfront.net`
   - **Authorization callback URL**: `https://d3elwe2avy3lk3.cloudfront.net/api/auth/callback/github`
4. Click "Register application"
5. Note the **Client ID** and generate a new **Client Secret**

### 2.2 Update Production Environment Variables

Current GitHub OAuth credentials in `.env.production`:
- `GITHUB_ID`: `Ov23lilEAHEuonTH43JZ`
- `GITHUB_SECRET`: `fef7c2f793bc81d920be01ed2ce5b04b69fea927`

**Action Required:**
1. Verify if these credentials are for production or create new ones
2. Update the callback URL in the GitHub OAuth app settings
3. Test the OAuth flow

### 2.3 Update SST Environment Variables

To update environment variables in the deployed application:

```bash
# Redeploy with updated environment variables
sst deploy --stage production
```

## Step 3: Environment Variables Management

### 3.1 Required Environment Variables

| Variable | Current Value | Status | Notes |
|----------|--------------|--------|-------|
| `DATABASE_URL` | ✅ Set | Configured | RDS PostgreSQL connection |
| `NEXTAUTH_URL` | ✅ Set | Configured | CloudFront URL |
| `NEXTAUTH_SECRET` | ✅ Set | Configured | Session encryption key |
| `GITHUB_ID` | ✅ Set | **Needs Verification** | Verify for production domain |
| `GITHUB_SECRET` | ✅ Set | **Needs Verification** | Verify for production domain |
| `GOOGLE_API_KEY` | ❌ Not Set | **Required** | Currently set to dummy value |
| `OPENAI_API_KEY` | ❌ Not Set | Optional | For OpenAI features |

### 3.2 Set Google API Key

The application requires a Google API key for AI features:

```bash
# Option 1: Update .env.production and redeploy
# Edit .env.production and replace OPENAI_API_KEY with GOOGLE_API_KEY

# Option 2: Use SST secrets (recommended for sensitive data)
sst secret set GOOGLE_API_KEY "your-actual-google-api-key" --stage production
```

### 3.3 Update SST Config for Secrets

If using SST secrets, update `sst.config.ts` to use them:

```typescript
environment: {
    // Use SST secrets for sensitive data
    GOOGLE_API_KEY: new sst.Secret("GOOGLE_API_KEY").value,
    // ... other variables
}
```

## Step 4: Production Verification

### 4.1 Test User Registration

1. Navigate to `https://d3elwe2avy3lk3.cloudfront.net`
2. Click "Sign in with GitHub"
3. Authorize the application
4. Verify user is created in the database

### 4.2 Test Repository Connection

1. After login, navigate to dashboard
2. Try to connect a GitHub repository
3. Verify repository data is fetched correctly

### 4.3 Test Database Operations

1. Create a new project
2. Add tasks to the project
3. Verify data is persisted in the production database

### 4.4 Monitor for Errors

Check CloudWatch logs for any errors:

```bash
# View logs
sst logs --stage production
```

## Step 5: Post-Deployment Checklist

- [ ] Database schema initialized
- [ ] All migrations applied successfully
- [ ] GitHub OAuth configured for production domain
- [ ] GitHub OAuth callback URL updated
- [ ] Google API key configured
- [ ] All environment variables verified
- [ ] User registration tested
- [ ] GitHub login tested
- [ ] Repository connection tested
- [ ] Database operations tested
- [ ] No 502/500 errors in production
- [ ] CloudWatch logs reviewed

## Troubleshooting

### Issue: 502 Bad Gateway

**Possible Causes:**
- Database connection failure
- Missing environment variables
- Lambda function timeout

**Solution:**
1. Check CloudWatch logs for specific error
2. Verify DATABASE_URL is accessible from Lambda
3. Ensure all required environment variables are set

### Issue: GitHub OAuth Fails

**Possible Causes:**
- Incorrect callback URL
- Wrong client ID/secret
- OAuth app not configured for production domain

**Solution:**
1. Verify callback URL matches exactly: `https://d3elwe2avy3lk3.cloudfront.net/api/auth/callback/github`
2. Check client ID and secret are correct
3. Ensure OAuth app is active

### Issue: Database Connection Timeout

**Possible Causes:**
- RDS security group not allowing Lambda access
- Incorrect connection string
- Database not running

**Solution:**
1. Check RDS security group allows inbound traffic from Lambda
2. Verify connection string is correct
3. Test connection using `psql` or database client

## Next Steps

After completing production setup:

1. **Custom Domain** (Optional)
   - Configure Route 53 or your DNS provider
   - Update NEXTAUTH_URL to custom domain
   - Update GitHub OAuth callback URL

2. **Monitoring**
   - Set up CloudWatch alarms
   - Configure error notifications
   - Set up uptime monitoring

3. **Backup Strategy**
   - Configure RDS automated backups
   - Set up point-in-time recovery
   - Document restore procedures

4. **Security Hardening**
   - Review security groups
   - Enable AWS WAF (optional)
   - Set up SSL/TLS certificates for custom domain

## Resources

- [SST Documentation](https://docs.sst.dev/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
