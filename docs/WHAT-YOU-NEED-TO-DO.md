# Production Setup - What YOU Need to Do

**Date**: 2026-01-06  
**Status**: 2/4 tasks complete - Action required from you

---

## ✅ Already Done (By AI)

1. ✅ **Production Database** - PostgreSQL initialized and ready
2. ✅ **Custom Domain** - https://ai-estimation.co.uk deployed
3. ✅ **SSL Certificate** - Valid and active
4. ✅ **DNS Records** - Created and propagating

---

## 🚨 What YOU Need to Do Now

### Task 1: Update GitHub OAuth Callback URL (5 minutes)

**Why**: Your app won't allow GitHub login until this is updated.

**Steps**:

1. **Open GitHub OAuth Settings**:
   - Go to: https://github.com/settings/developers
   - Or: GitHub → Settings → Developer settings → OAuth Apps

2. **Find Your OAuth App**:
   - Look for an existing app (might be called "AI Estimation" or similar)
   - OR click **"New OAuth App"** to create a new one for production

3. **Update/Create OAuth App**:
   
   | Field | Value |
   |-------|-------|
   | **Application name** | `AI Estimation (Production)` |
   | **Homepage URL** | `https://ai-estimation.co.uk` |
   | **Authorization callback URL** | `https://ai-estimation.co.uk/api/auth/callback/github` |

4. **Get Credentials**:
   - Copy the **Client ID** (looks like: `Ov23liXXXXXXXXXXXXXX`)
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** immediately (you can't see it again!)

5. **Update Environment Variables** (if you created a new app):
   - Open `.env.production` file
   - Replace:
     ```bash
     GITHUB_ID="<paste-your-new-client-id>"
     GITHUB_SECRET="<paste-your-new-client-secret>"
     ```
   - Save the file

6. **Redeploy** (only if you changed credentials):
   ```bash
   npx sst deploy --stage production
   ```

**Current OAuth Credentials** (check if these need updating):
```
GITHUB_ID="Ov23lilEAHEuonTH43JZ"
GITHUB_SECRET="fef7c2f793bc81d920be01ed2ce5b04b69fea927"
```

**⚠️ CRITICAL**: The callback URL MUST be exactly:
```
https://ai-estimation.co.uk/api/auth/callback/github
```
No trailing slash! No extra spaces!

---

### Task 2: Set Up Google API Key (10 minutes)

**Why**: Your app uses Google AI for estimation features.

**Steps**:

1. **Get Google API Key**:
   - Go to: https://console.cloud.google.com/
   - Create a new project (or select existing)
   - Enable **"Generative Language API"** (for Gemini)
   - Go to **"Credentials"**
   - Click **"Create Credentials"** → **"API Key"**
   - Copy the API key

2. **Update Environment Variable**:
   - Open `.env.production` file
   - Replace:
     ```bash
     GOOGLE_API_KEY="<paste-your-google-api-key>"
     ```
   - Save the file

3. **Redeploy**:
   ```bash
   npx sst deploy --stage production
   ```

**Current Value** (needs to be replaced):
```
GOOGLE_API_KEY="dummy-key"  # ❌ Not a real key
```

---

### Task 3: Test Everything (15 minutes)

**After completing Tasks 1 & 2, test your production site:**

#### 3.1 Wait for DNS Propagation
```bash
# Check if domain resolves (run this every 5-10 minutes)
nslookup ai-estimation.co.uk
```

Expected: Should show IP addresses like `18.244.124.54`

#### 3.2 Test Website
1. Open: https://ai-estimation.co.uk
2. Verify:
   - ✅ Site loads correctly
   - ✅ Green padlock (SSL valid)
   - ✅ No certificate warnings

#### 3.3 Test www Redirect
1. Open: https://www.ai-estimation.co.uk
2. Verify: Redirects to https://ai-estimation.co.uk

#### 3.4 Test GitHub OAuth Login
1. Open: https://ai-estimation.co.uk
2. Click **"Sign in with GitHub"**
3. Verify:
   - ✅ GitHub authorization page appears
   - ✅ Shows "AI Estimation (Production)"
   - ✅ After authorization, redirects back to your site
   - ✅ You're logged in

#### 3.5 Verify Database
```bash
# Check if user was created in database
DATABASE_URL="postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require" \
npx tsx scripts/setup-production-db.ts --verify-only
```

Expected: Should show `users: 1 records` (or more)

#### 3.6 Test Repository Connection
1. After logging in, go to dashboard
2. Try to connect a GitHub repository
3. Verify: Repository list loads

---

## 📋 Quick Checklist

**Before Testing**:
- [ ] GitHub OAuth callback URL updated
- [ ] Google API key added to `.env.production`
- [ ] Redeployed if credentials changed
- [ ] Waited 5-10 minutes for DNS propagation

**Testing**:
- [ ] https://ai-estimation.co.uk loads
- [ ] SSL certificate valid (green padlock)
- [ ] www redirect works
- [ ] GitHub login works
- [ ] User created in database
- [ ] Repository connection works

---

## 🆘 Troubleshooting

### Problem: "Redirect URI mismatch" error

**Solution**:
1. Go to GitHub OAuth app settings
2. Verify callback URL is EXACTLY: `https://ai-estimation.co.uk/api/auth/callback/github`
3. No trailing slash, no typos
4. Save and try again

### Problem: Site shows "Server Not Found"

**Solution**:
- DNS hasn't propagated yet
- Wait 10-30 more minutes
- Check: `nslookup ai-estimation.co.uk`

### Problem: SSL certificate error

**Solution**:
- Wait a few more minutes for CloudFront to update
- Clear browser cache
- Try incognito/private window

### Problem: GitHub login works but user not created

**Solution**:
1. Check CloudWatch logs:
   ```bash
   npx sst logs --stage production
   ```
2. Verify database connection
3. Check for errors in logs

---

## 📞 Need Help?

If you encounter issues:

1. **Check logs**:
   ```bash
   npx sst logs --stage production
   ```

2. **Verify deployment**:
   ```bash
   npx sst deploy --stage production
   ```

3. **Check DNS**:
   ```bash
   nslookup ai-estimation.co.uk
   dig ai-estimation.co.uk
   ```

---

## ⏱️ Time Estimate

- **Task 1** (GitHub OAuth): 5 minutes
- **Task 2** (Google API): 10 minutes  
- **Task 3** (Testing): 15 minutes
- **DNS Wait Time**: 5-60 minutes (usually 10-20 minutes)

**Total**: 30-90 minutes

---

## 🎯 After Everything Works

Once all tests pass:

1. **Document your setup**:
   - Save GitHub OAuth credentials securely
   - Save Google API key securely
   - Note any issues encountered

2. **Update task status**:
   - Mark Phase 7.2 (GitHub OAuth) as complete
   - Mark Phase 7.3 (Environment Management) as complete
   - Mark Phase 7.4 (Verification) as complete

3. **Celebrate!** 🎉
   - Your app is live in production
   - Custom domain working
   - SSL enabled
   - Database ready
   - OAuth working

---

## 📝 Summary

**What's Already Done**:
- ✅ Database initialized
- ✅ Domain deployed
- ✅ SSL certificate active
- ✅ DNS configured

**What YOU Need to Do**:
1. Update GitHub OAuth callback URL
2. Add Google API key
3. Test everything

**That's it!** Simple and straightforward.

---

**Created**: 2026-01-06  
**Status**: Awaiting your action  
**Estimated Time**: 30-90 minutes total
