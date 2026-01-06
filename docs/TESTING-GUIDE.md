# Production Deployment Complete - Testing Guide

**Deployed**: 2026-01-06 13:40 UTC  
**Status**: ✅ **READY TO TEST**  
**URL**: https://ai-estimation.co.uk

---

## ✅ What Was Deployed

### GitHub OAuth Credentials Updated
- **Client ID**: `Ov23liP9U59tJvOLKHkt`
- **Client Secret**: `b113a7ce39bf050d354f49e855a4909711f52a02`
- **Callback URL**: `https://ai-estimation.co.uk/api/auth/callback/github`

### Deployment Details
- **Build Time**: ~3 minutes
- **Lambda Functions**: Updated
- **CloudFront**: Cache invalidated
- **Status**: Successfully deployed

---

## 🧪 How to Test (Step-by-Step)

### Step 1: Open the Site

1. **Open your browser** (use incognito/private mode for clean test)
2. **Go to**: https://ai-estimation.co.uk
3. **Verify**:
   - ✅ Site loads correctly
   - ✅ Green padlock (SSL certificate valid)
   - ✅ No certificate warnings
   - ✅ URL shows `ai-estimation.co.uk` (not CloudFront)

---

### Step 2: Test GitHub OAuth Login

1. **Click** "Sign in with GitHub" button
2. **You should see**:
   - GitHub authorization page
   - App name shown (check it matches your OAuth app)
   - Permissions requested
3. **Click** "Authorize" or "Continue"
4. **Expected result**:
   - Redirected back to `https://ai-estimation.co.uk`
   - You are logged in
   - Your GitHub profile/avatar appears
   - Dashboard is accessible

---

### Step 3: Verify Database

After logging in, check if your user was created:

```bash
DATABASE_URL="postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require" \
npx tsx scripts/setup-production-db.ts --verify-only
```

**Expected output**:
```
✅ users: 1 records  (or more if you tested multiple times)
```

---

### Step 4: Test Repository Connection

1. **After login**, navigate to dashboard
2. **Click** "Connect Repository" or similar
3. **Verify**:
   - ✅ GitHub repositories list loads
   - ✅ You can select a repository
   - ✅ Repository data is fetched correctly

---

### Step 5: Test AI Chat (Optional)

1. **Navigate to** a task or project
2. **Open** the AI chat/enquiry feature
3. **Send a message**
4. **Verify**:
   - ✅ AI responds (using AWS Bedrock/Claude)
   - ✅ Responses stream in real-time
   - ✅ No errors in console

---

## ✅ Testing Checklist

**Basic Functionality**:
- [ ] Site loads at https://ai-estimation.co.uk
- [ ] SSL certificate valid (green padlock)
- [ ] No console errors
- [ ] GitHub login button visible

**GitHub OAuth**:
- [ ] Click "Sign in with GitHub" works
- [ ] GitHub authorization page appears
- [ ] After authorization, redirected back to site
- [ ] User is logged in
- [ ] Profile/avatar displayed

**Database**:
- [ ] User created in production database
- [ ] User data persists after logout/login

**Features**:
- [ ] Dashboard accessible
- [ ] Repository list loads
- [ ] Can connect repositories
- [ ] AI chat works (if tested)

---

## 🆘 Troubleshooting

### Issue: "Redirect URI mismatch"

**Cause**: GitHub OAuth callback URL doesn't match.

**Solution**:
1. Go to: https://github.com/settings/developers
2. Click your OAuth app
3. Verify callback URL is EXACTLY:
   ```
   https://ai-estimation.co.uk/api/auth/callback/github
   ```
4. Save and try again

---

### Issue: Site shows old CloudFront URL

**Cause**: Browser cache or DNS not fully propagated.

**Solution**:
1. Clear browser cache
2. Try incognito/private window
3. Wait 5-10 more minutes for DNS
4. Check DNS: `nslookup ai-estimation.co.uk`

---

### Issue: GitHub login works but user not created

**Cause**: Database connection issue or error in auth flow.

**Solution**:
1. Check CloudWatch logs:
   ```bash
   npx sst logs --stage production
   ```
2. Look for errors related to database or NextAuth
3. Verify database connection is working

---

### Issue: AI chat doesn't work

**Cause**: AWS Bedrock permissions or credentials issue.

**Solution**:
1. Verify AWS credentials are configured
2. Check CloudWatch logs for Bedrock errors
3. Ensure Bedrock is enabled in eu-west-1 region

---

## 📊 Expected Results

### Successful Test
```
✅ Site loads: https://ai-estimation.co.uk
✅ SSL valid: Green padlock
✅ GitHub login: Works
✅ User created: In database
✅ Dashboard: Accessible
✅ Repositories: Can connect
```

### If All Tests Pass
**Congratulations!** 🎉 Your production deployment is complete and working!

---

## 📝 What to Report

If you encounter issues, please provide:

1. **Which step failed**: (e.g., "Step 2: GitHub OAuth")
2. **Error message**: (exact text or screenshot)
3. **Browser console errors**: (F12 → Console tab)
4. **CloudWatch logs** (if available):
   ```bash
   npx sst logs --stage production
   ```

---

## 🎯 Next Steps After Successful Testing

Once all tests pass:

1. **Document the setup**:
   - Save OAuth credentials securely
   - Note any issues encountered
   - Update team documentation

2. **Monitor production**:
   - Check CloudWatch logs periodically
   - Monitor error rates
   - Track user registrations

3. **Optional improvements**:
   - Set up custom email domain
   - Configure monitoring alerts
   - Set up automated backups

---

## 🔗 Quick Links

- **Production Site**: https://ai-estimation.co.uk
- **GitHub OAuth Settings**: https://github.com/settings/developers
- **AWS Console**: https://console.aws.amazon.com/
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/
- **SST Console**: https://sst.dev/u/eeaf3339

---

**Deployment completed**: 2026-01-06 13:40 UTC  
**Ready for testing**: YES ✅  
**Estimated test time**: 15-20 minutes

Good luck with testing! 🚀
