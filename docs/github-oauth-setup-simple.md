# GitHub OAuth Setup - Simple Guide

**Time Required**: 5 minutes  
**What You'll Do**: Update your GitHub OAuth app to work with your production domain

---

## 🎯 Quick Overview

You need to tell GitHub that your app is now at `https://ai-estimation.co.uk` instead of the CloudFront URL.

---

## 📋 Step-by-Step Instructions

### Step 1: Open GitHub OAuth Settings

1. **Click this link**: https://github.com/settings/developers
   
   OR
   
2. **Manual navigation**:
   - Go to GitHub.com
   - Click your profile picture (top right)
   - Click **"Settings"**
   - Scroll down to **"Developer settings"** (bottom of left sidebar)
   - Click **"OAuth Apps"**

---

### Step 2: Find or Create Your OAuth App

You'll see a list of OAuth apps. Look for one that might be for this project.

#### **Option A: You Already Have an OAuth App**

If you see an app (might be called "AI Estimation" or similar):
1. **Click on the app name**
2. **Go to Step 3**

#### **Option B: Create a New OAuth App**

If you don't have one, or want a separate one for production:
1. **Click "New OAuth App"** button (top right)
2. **Fill in the form**:

   ```
   Application name: AI Estimation (Production)
   Homepage URL: https://ai-estimation.co.uk
   Application description: AI-powered project estimation platform (optional)
   Authorization callback URL: https://ai-estimation.co.uk/api/auth/callback/github
   ```

3. **Click "Register application"**
4. **Go to Step 3**

---

### Step 3: Update the Callback URL

This is the **MOST IMPORTANT** step!

1. **Find the field**: "Authorization callback URL"

2. **Replace** whatever is there with:
   ```
   https://ai-estimation.co.uk/api/auth/callback/github
   ```

3. **Important**: 
   - ✅ Use `https://` (not `http://`)
   - ✅ No trailing slash at the end
   - ✅ Exact spelling: `ai-estimation.co.uk`
   - ✅ Path must be: `/api/auth/callback/github`

4. **Click "Update application"** (at the bottom)

---

### Step 4: Get Your Credentials

After saving, you'll see:

1. **Client ID**: 
   - It's displayed on the page
   - Looks like: `Ov23liXXXXXXXXXXXXXX`
   - **Copy this**

2. **Client Secret**:
   - If you just created the app, you'll see it once
   - If updating existing app, you might need to generate a new one:
     - Click **"Generate a new client secret"**
     - **Copy it IMMEDIATELY** (you can't see it again!)
   - Looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 5: Check If You Need to Update .env.production

**Current credentials in your `.env.production`**:
```
GITHUB_ID="Ov23lilEAHEuonTH43JZ"
GITHUB_SECRET="fef7c2f793bc81d920be01ed2ce5b04b69fea927"
```

**Two scenarios**:

#### **Scenario A: You Updated an Existing App**
- If you just changed the callback URL on an existing app
- And the Client ID above matches your app
- **You're done!** No need to change anything
- **Skip to Step 6**

#### **Scenario B: You Created a New App**
- If you created a brand new OAuth app
- You need to update `.env.production`:

1. **Open** `.env.production` file in your editor

2. **Replace** these lines:
   ```bash
   GITHUB_ID="<paste-your-new-client-id>"
   GITHUB_SECRET="<paste-your-new-client-secret>"
   ```

3. **Save** the file

4. **Redeploy**:
   ```bash
   npx sst deploy --stage production
   ```
   (This will take about 5 minutes)

---

### Step 6: Done! ✅

That's it! Your GitHub OAuth is now configured for production.

---

## 🧪 How to Test

After DNS propagates (10-20 minutes from initial deployment):

1. **Open**: https://ai-estimation.co.uk
2. **Click**: "Sign in with GitHub"
3. **You should see**:
   - GitHub authorization page
   - App name: "AI Estimation (Production)" (or whatever you named it)
   - Permissions requested
4. **Click**: "Authorize"
5. **You should**:
   - Be redirected back to https://ai-estimation.co.uk
   - Be logged in
   - See your GitHub profile

---

## ❓ FAQ

### Q: Do I need to update the callback URL?
**A**: YES! This is required. Without it, GitHub login won't work.

### Q: Can I use my existing development OAuth app?
**A**: You can, but it's better to create a separate one for production. This way:
- Development and production are isolated
- You can revoke production access without affecting development
- Better security practice

### Q: What if I already updated the callback URL earlier?
**A**: Check if it's set to `https://ai-estimation.co.uk/api/auth/callback/github`. If yes, you're good!

### Q: Do I need to redeploy after changing the callback URL?
**A**: Only if you created a NEW OAuth app and updated the credentials in `.env.production`. If you just changed the callback URL on an existing app, no redeploy needed.

---

## 🆘 Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: The callback URL doesn't match.

**Solution**:
1. Go back to GitHub OAuth app settings
2. Verify the callback URL is EXACTLY:
   ```
   https://ai-estimation.co.uk/api/auth/callback/github
   ```
3. No typos, no trailing slash, no extra spaces
4. Save and try again

### Error: "Application suspended"

**Problem**: GitHub suspended your OAuth app (rare).

**Solution**:
- Check your email for suspension notice
- Contact GitHub support
- Create a new OAuth app

### Can't find OAuth Apps section

**Problem**: You're in the wrong settings area.

**Solution**:
- Go to: https://github.com/settings/developers
- Or: Profile → Settings → Developer settings (bottom left) → OAuth Apps

---

## ✅ Checklist

Before you finish:

- [ ] Opened GitHub OAuth settings
- [ ] Found or created OAuth app
- [ ] Updated callback URL to: `https://ai-estimation.co.uk/api/auth/callback/github`
- [ ] Saved changes
- [ ] (If new app) Updated `.env.production` with new credentials
- [ ] (If new app) Redeployed with `npx sst deploy --stage production`

---

## 🎯 What's Next

After completing this:

1. **Wait** for DNS to propagate (10-20 minutes)
2. **Test** the site at https://ai-estimation.co.uk
3. **Try** GitHub login
4. **Celebrate!** 🎉 Your app is live in production

---

**That's it!** Simple and straightforward. The whole process should take about 5 minutes.

If you run into any issues, check the troubleshooting section above.
