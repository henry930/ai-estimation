# GitHub OAuth Production Configuration - Step-by-Step Guide

**Task**: Phase 7.2 - GitHub OAuth Production Configuration  
**Estimated Time**: 30 minutes  
**Prerequisites**: GitHub account with repository access

---

## Overview

You need to create a new GitHub OAuth application specifically for your production environment. This is separate from your development OAuth app to ensure security and proper callback URL configuration.

---

## Step-by-Step Instructions

### Step 1: Access GitHub OAuth Settings

1. **Open GitHub** in your browser
2. **Click your profile picture** (top right corner)
3. **Select "Settings"** from the dropdown menu
4. **Scroll down** to the bottom of the left sidebar
5. **Click "Developer settings"**
6. **Click "OAuth Apps"** in the left sidebar

**Direct Link**: https://github.com/settings/developers

---

### Step 2: Create New OAuth Application

1. **Click the "New OAuth App"** button (top right)
   - If you don't see this button, click "OAuth Apps" first

2. **Fill in the Application Details**:

   | Field | Value | Notes |
   |-------|-------|-------|
   | **Application name** | `AI Estimation (Production)` | Distinguishes from dev app |
   | **Homepage URL** | `https://d3elwe2avy3lk3.cloudfront.net` | Your CloudFront URL |
   | **Application description** | `AI-powered project estimation platform - Production` | Optional but recommended |
   | **Authorization callback URL** | `https://d3elwe2avy3lk3.cloudfront.net/api/auth/callback/github` | Critical - must be exact |

   **⚠️ IMPORTANT**: The callback URL must match EXACTLY. No trailing slashes!

3. **Click "Register application"**

---

### Step 3: Get Your OAuth Credentials

After creating the app, you'll see the OAuth app details page:

1. **Copy the Client ID**
   - You'll see something like: `Ov23liXXXXXXXXXXXXXX`
   - Click the copy icon next to it
   - **Save this** - you'll need it in Step 5

2. **Generate a Client Secret**
   - Click **"Generate a new client secret"**
   - **⚠️ CRITICAL**: Copy the secret immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Save this securely** - you'll need it in Step 5

---

### Step 4: Configure OAuth Permissions (Optional but Recommended)

While still on the OAuth app page:

1. Scroll down to **"Application permissions"**
2. Ensure these are enabled:
   - ✅ **Read user profile data** (enabled by default)
   - ✅ **Read repository data** (for repo integration)
   - ✅ **Read organization data** (if using with orgs)

---

### Step 5: Update Production Environment Variables

Now you need to update your production environment with the new OAuth credentials.

#### Option A: Update `.env.production` File (Recommended for SST)

1. **Open** `.env.production` in your editor
2. **Replace** the existing GitHub credentials:

```bash
# GitHub OAuth - Production
GITHUB_ID="Ov23liXXXXXXXXXXXXXX"  # Replace with your new Client ID
GITHUB_SECRET="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Replace with your new Client Secret
```

3. **Save the file**

#### Option B: Use SST Secrets (More Secure)

Run these commands in your terminal:

```bash
# Set GitHub Client ID
sst secret set GITHUB_ID "Ov23liXXXXXXXXXXXXXX" --stage production

# Set GitHub Client Secret
sst secret set GITHUB_SECRET "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --stage production
```

---

### Step 6: Verify Environment Variables

Let's verify the current production environment variables:

**Current values in `.env.production`**:
```bash
GITHUB_ID="Ov23lilEAHEuonTH43JZ"
GITHUB_SECRET="fef7c2f793bc81d920be01ed2ce5b04b69fea927"
```

**⚠️ ACTION REQUIRED**: 
- Check if these credentials are for development or production
- If they're for development, replace them with your new production credentials
- If they're already for production, verify the callback URL in GitHub

---

### Step 7: Update SST Configuration (If Using SST Secrets)

If you chose Option B above, update `sst.config.ts`:

```typescript
// In sst.config.ts, update the environment section:
environment: {
    // ... other variables ...
    
    // GitHub OAuth - Use SST secrets for production
    GITHUB_ID: new sst.Secret("GITHUB_ID").value,
    GITHUB_SECRET: new sst.Secret("GITHUB_SECRET").value,
    
    // ... other variables ...
}
```

---

### Step 8: Redeploy to Production

After updating the environment variables, redeploy your application:

```bash
# Deploy to production with updated environment variables
sst deploy --stage production
```

This will:
- ✅ Update the Lambda functions with new environment variables
- ✅ Restart the application with new OAuth credentials
- ✅ Make the new GitHub OAuth app active

**Expected output**:
```
✔ Complete
   AiEstimationSite: https://d3elwe2avy3lk3.cloudfront.net
```

---

### Step 9: Test the OAuth Flow

1. **Open your production URL** in an incognito/private browser window:
   ```
   https://d3elwe2avy3lk3.cloudfront.net
   ```

2. **Click "Sign in with GitHub"**

3. **You should see the GitHub authorization page** with:
   - Application name: "AI Estimation (Production)"
   - Permissions requested
   - Your GitHub profile

4. **Click "Authorize"**

5. **You should be redirected back** to your application dashboard

6. **Verify you're logged in** - check if your profile appears

---

### Step 10: Verify in Database

After successful login, verify the user was created in the production database:

```bash
# Run verification script
DATABASE_URL="postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require" \
npx tsx scripts/setup-production-db.ts --verify-only
```

You should see:
```
✅ users: 1 records  # (or more if you test multiple times)
```

---

## Troubleshooting

### Issue 1: "Redirect URI mismatch" Error

**Symptom**: After clicking "Sign in with GitHub", you see an error about redirect URI.

**Solution**:
1. Go back to GitHub OAuth app settings
2. Verify the callback URL is EXACTLY:
   ```
   https://d3elwe2avy3lk3.cloudfront.net/api/auth/callback/github
   ```
3. No trailing slash, no extra spaces
4. Save and try again

---

### Issue 2: "Invalid client" Error

**Symptom**: Error message about invalid client credentials.

**Solution**:
1. Verify you copied the Client ID correctly
2. Verify you copied the Client Secret correctly
3. Make sure there are no extra spaces or quotes
4. Redeploy after fixing: `sst deploy --stage production`

---

### Issue 3: OAuth Works but User Not Created

**Symptom**: Login succeeds but user doesn't appear in database.

**Solution**:
1. Check CloudWatch logs for errors:
   ```bash
   sst logs --stage production
   ```
2. Verify database connection is working
3. Check NextAuth configuration in `src/lib/auth.ts`

---

### Issue 4: "Application Suspended" Message

**Symptom**: GitHub shows "This application has been suspended"

**Solution**:
1. Check your GitHub account email for suspension notice
2. Usually happens if OAuth app violates GitHub policies
3. Contact GitHub support if needed

---

## Security Best Practices

✅ **DO**:
- Use different OAuth apps for development and production
- Store secrets in environment variables, never in code
- Use SST secrets for production credentials
- Rotate secrets periodically (every 90 days)
- Limit OAuth scopes to only what's needed

❌ **DON'T**:
- Commit `.env.production` to git (it's in `.gitignore`)
- Share Client Secret publicly
- Use the same OAuth app for dev and prod
- Store secrets in frontend code

---

## Verification Checklist

Before marking this task as complete, verify:

- [ ] New GitHub OAuth app created for production
- [ ] Client ID and Secret copied and saved securely
- [ ] Callback URL configured correctly
- [ ] Environment variables updated (`.env.production` or SST secrets)
- [ ] Application redeployed to production
- [ ] OAuth login tested successfully
- [ ] User created in production database
- [ ] No errors in CloudWatch logs

---

## Quick Reference

**Production OAuth App Details**:
- **Name**: AI Estimation (Production)
- **Homepage**: https://d3elwe2avy3lk3.cloudfront.net
- **Callback**: https://d3elwe2avy3lk3.cloudfront.net/api/auth/callback/github

**Environment Variables**:
```bash
GITHUB_ID="<your-client-id>"
GITHUB_SECRET="<your-client-secret>"
NEXTAUTH_URL="https://d3elwe2avy3lk3.cloudfront.net"
```

**Useful Commands**:
```bash
# Deploy to production
sst deploy --stage production

# View logs
sst logs --stage production

# Set secret
sst secret set GITHUB_ID "value" --stage production

# Verify database
DATABASE_URL="<prod-url>" npx tsx scripts/setup-production-db.ts --verify-only
```

---

## Next Steps

After completing this task:
1. ✅ Mark task as completed in `production-setup.md`
2. ✅ Document the Client ID (not secret) in completion report
3. ✅ Move to Sub-task 3: Environment Variables Management

---

**Need Help?**
- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps
- NextAuth GitHub Provider: https://next-auth.js.org/providers/github
- SST Secrets: https://docs.sst.dev/config#secrets

---

**Created**: 2026-01-06  
**Task**: Phase 7.2 - GitHub OAuth Production Configuration  
**Status**: Ready to Execute
