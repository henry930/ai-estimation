# GitHub OAuth Internal Error - Quick Fix

**Error**: Internal error when GitHub redirects back to the app  
**URL**: `https://ai-estimation.co.uk/api/auth/callback/github?code=...&state=...`

---

## 🔍 Most Likely Causes

1. **Database connection issue** - Can't create/find user
2. **NEXTAUTH_SECRET not set** - Session encryption fails
3. **NEXTAUTH_URL mismatch** - Callback validation fails

---

## 🛠️ Quick Fixes to Try

### Fix 1: Verify Environment Variables Are Deployed

The issue is likely that the environment variables aren't being passed to Lambda correctly.

**Check the SST config**:

Open `sst.config.ts` and verify these lines exist:

```typescript
environment: {
    DATABASE_URL: process.env.DATABASE_URL || "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://ai-estimation.co.uk",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
    GITHUB_ID: process.env.GITHUB_ID || "",
    GITHUB_SECRET: process.env.GITHUB_SECRET || "",
    // ... other vars
}
```

**If they're there**, the issue might be that `.env.production` isn't being loaded during deployment.

---

### Fix 2: Set Environment Variables Explicitly in SST

Instead of relying on `.env.production`, set them directly in `sst.config.ts`:

```typescript
environment: {
    DATABASE_URL: "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require",
    NEXTAUTH_URL: "https://ai-estimation.co.uk",
    NEXTAUTH_SECRET: "WNffvEuHZqDhmPXtx1ng/3YEKQraxty983f/UzFN2fg=",
    GITHUB_ID: "Ov23liP9U59tJvOLKHkt",
    GITHUB_SECRET: "b113a7ce39bf050d354f49e855a4909711f52a02",
    NODE_ENV: "production",
}
```

Then redeploy:
```bash
npx sst deploy --stage production
```

---

### Fix 3: Use SST Secrets (Most Secure)

Set secrets using SST CLI:

```bash
# Set each secret
npx sst secret set DATABASE_URL "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require" --stage production

npx sst secret set NEXTAUTH_SECRET "WNffvEuHZqDhmPXtx1ng/3YEKQraxty983f/UzFN2fg=" --stage production

npx sst secret set GITHUB_ID "Ov23liP9U59tJvOLKHkt" --stage production

npx sst secret set GITHUB_SECRET "b113a7ce39bf050d354f49e855a4909711f52a02" --stage production
```

Then update `sst.config.ts`:
```typescript
environment: {
    DATABASE_URL: new sst.Secret("DATABASE_URL").value,
    NEXTAUTH_URL: "https://ai-estimation.co.uk",
    NEXTAUTH_SECRET: new sst.Secret("NEXTAUTH_SECRET").value,
    GITHUB_ID: new sst.Secret("GITHUB_ID").value,
    GITHUB_SECRET: new sst.Secret("GITHUB_SECRET").value,
    NODE_ENV: "production",
}
```

Redeploy:
```bash
npx sst deploy --stage production
```

---

## 🎯 Recommended Solution

**Use Fix 2** (hardcode in sst.config.ts) - it's the quickest and most reliable for now.

### Step-by-Step:

1. **Open** `sst.config.ts`

2. **Replace** the `environment` section with hardcoded values:
   ```typescript
   environment: {
       DATABASE_URL: "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require",
       NEXTAUTH_URL: "https://ai-estimation.co.uk",
       NEXTAUTH_SECRET: "WNffvEuHZqDhmPXtx1ng/3YEKQraxty983f/UzFN2fg=",
       GITHUB_ID: "Ov23liP9U59tJvOLKHkt",
       GITHUB_SECRET: "b113a7ce39bf050d354f49e855a4909711f52a02",
       
       // AWS Bedrock
       BEDROCK_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
       BEDROCK_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
       BEDROCK_AWS_REGION: "eu-west-1",
       
       NODE_ENV: "production",
   }
   ```

3. **Save** the file

4. **Redeploy**:
   ```bash
   npx sst deploy --stage production
   ```

5. **Test** again after deployment completes

---

## 🔍 How to Verify It's Fixed

After redeploying:

1. Open: https://ai-estimation.co.uk
2. Click "Sign in with GitHub"
3. Authorize
4. You should be redirected back and logged in (no error)

---

## 📝 Why This Happens

SST doesn't automatically load `.env.production` during deployment. You need to either:
- Use `process.env.VAR_NAME` (loads from your local environment)
- Hardcode values in `sst.config.ts`
- Use SST secrets

Since you're deploying from your local machine, `process.env` reads from your shell environment, not from `.env.production`.

---

## ⚠️ Security Note

Hardcoding secrets in `sst.config.ts` is fine for now, but:
- ❌ Don't commit `sst.config.ts` with secrets to a public repo
- ✅ Use SST secrets for production (Fix 3) for better security
- ✅ Add `sst.config.ts` to `.gitignore` if it contains secrets

---

**Quick action**: Use Fix 2, redeploy, test again!
