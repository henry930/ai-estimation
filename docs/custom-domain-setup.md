# Custom Domain Setup Guide - ai-estimation.co.uk

**Domain**: ai-estimation.co.uk  
**Current URL**: https://d3elwe2avy3lk3.cloudfront.net  
**Target**: Point domain to CloudFront distribution  
**Estimated Time**: 30-45 minutes

---

## Overview

Your Next.js application is deployed via SST to AWS CloudFront (CDN), not directly to S3. We need to:
1. Configure the domain in Route 53
2. Request an SSL certificate
3. Update SST configuration to use custom domain
4. Update CloudFront distribution
5. Update environment variables and OAuth callbacks

---

## Prerequisites

- ✅ Domain registered in Route 53: `ai-estimation.co.uk`
- ✅ AWS CLI configured
- ✅ Access to AWS Console

---

## Step-by-Step Instructions

### Step 1: Verify Domain in Route 53

1. **Open AWS Console** → Route 53
2. **Click "Hosted zones"**
3. **Verify** `ai-estimation.co.uk` is listed
4. **Note the Hosted Zone ID** (you'll need this)

**Or check via CLI**:
```bash
aws route53 list-hosted-zones --query "HostedZones[?Name=='ai-estimation.co.uk.']"
```

---

### Step 2: Request SSL Certificate (ACM)

**⚠️ IMPORTANT**: CloudFront requires certificates in **us-east-1** region!

#### Option A: Via AWS Console

1. **Open AWS Console** → Certificate Manager
2. **Switch region** to **US East (N. Virginia) - us-east-1** (top right)
3. **Click "Request certificate"**
4. **Choose "Request a public certificate"**
5. **Add domain names**:
   - `ai-estimation.co.uk`
   - `www.ai-estimation.co.uk` (optional but recommended)
6. **Validation method**: Choose **DNS validation**
7. **Click "Request"**
8. **Click "Create records in Route 53"** (this auto-validates)
9. **Wait 5-10 minutes** for validation to complete

#### Option B: Via AWS CLI

```bash
# Request certificate
aws acm request-certificate \
  --domain-name ai-estimation.co.uk \
  --subject-alternative-names www.ai-estimation.co.uk \
  --validation-method DNS \
  --region us-east-1

# Note the CertificateArn from the output
```

**Expected output**:
```json
{
    "CertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
}
```

---

### Step 3: Update SST Configuration

Update `sst.config.ts` to use your custom domain:

```typescript
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "ai-estimation",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        // Create Next.js site with custom domain
        const site = new sst.aws.Nextjs("AiEstimationSite", {
            // Add custom domain configuration
            domain: {
                name: "ai-estimation.co.uk",
                aliases: ["www.ai-estimation.co.uk"],
                dns: sst.cloudflare.dns(), // or sst.aws.dns() if using Route 53
            },
            
            environment: {
                // Database
                DATABASE_URL: process.env.DATABASE_URL || "",

                // NextAuth - UPDATE with custom domain
                NEXTAUTH_URL: "https://ai-estimation.co.uk",
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",

                // GitHub OAuth
                GITHUB_ID: process.env.GITHUB_ID || "",
                GITHUB_SECRET: process.env.GITHUB_SECRET || "",

                // Google API
                GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",

                // AWS Bedrock
                BEDROCK_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
                BEDROCK_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
                BEDROCK_AWS_REGION: process.env.AWS_REGION || "eu-west-1",

                NODE_ENV: "production",
            },
        });

        return {
            site: site.url,
            domain: site.domain,
        };
    },
});
```

**Key changes**:
- Added `domain` configuration
- Updated `NEXTAUTH_URL` to use custom domain

---

### Step 4: Update Environment Variables

Update `.env.production`:

```bash
# NextAuth - Updated with custom domain
NEXTAUTH_URL="https://ai-estimation.co.uk"
NEXTAUTH_SECRET="WNffvEuHZqDhmPXtx1ng/3YEKQraxty983f/UzFN2fg="

# GitHub OAuth - IMPORTANT: Update callback URL!
GITHUB_ID="Ov23lilEAHEuonTH43JZ"
GITHUB_SECRET="fef7c2f793bc81d920be01ed2ce5b04b69fea927"
```

---

### Step 5: Update GitHub OAuth Callback URL

**⚠️ CRITICAL**: Update your GitHub OAuth app with the new domain!

1. **Go to**: https://github.com/settings/developers
2. **Click your OAuth app** (AI Estimation Production)
3. **Update "Authorization callback URL"** to:
   ```
   https://ai-estimation.co.uk/api/auth/callback/github
   ```
4. **Click "Update application"**

**Optional**: Add www subdomain callback:
```
https://www.ai-estimation.co.uk/api/auth/callback/github
```

---

### Step 6: Deploy with Custom Domain

```bash
# Deploy to production with custom domain
sst deploy --stage production
```

**What happens**:
1. SST creates/updates CloudFront distribution
2. Configures custom domain with SSL certificate
3. Creates Route 53 DNS records automatically
4. Updates all environment variables

**Expected output**:
```
✔ Complete
   AiEstimationSite: 
     url: https://ai-estimation.co.uk
     domain: ai-estimation.co.uk
```

---

### Step 7: Verify DNS Propagation

DNS changes can take 5-60 minutes to propagate.

**Check DNS**:
```bash
# Check if domain resolves
nslookup ai-estimation.co.uk

# Check if it points to CloudFront
dig ai-estimation.co.uk
```

**Expected**: Should show CloudFront distribution domain

---

### Step 8: Test the Custom Domain

1. **Wait 5-10 minutes** for DNS propagation
2. **Open**: https://ai-estimation.co.uk
3. **Verify**:
   - ✅ Site loads correctly
   - ✅ SSL certificate is valid (green padlock)
   - ✅ No certificate warnings
   - ✅ Content displays properly

---

### Step 9: Test GitHub OAuth

1. **Open** https://ai-estimation.co.uk in incognito mode
2. **Click "Sign in with GitHub"**
3. **Verify** OAuth flow works
4. **Check** you're redirected back to the custom domain (not CloudFront URL)

---

### Step 10: Update Documentation

Update all references from CloudFront URL to custom domain:

**Files to update**:
- `README.md`
- `docs/production-setup-guide.md`
- `docs/github-oauth-production-setup.md`
- `tasks/phase-7-production-setup/production-setup.md`

---

## Alternative: Manual CloudFront Configuration

If SST domain configuration doesn't work, you can manually configure CloudFront:

### Manual Steps:

1. **Get CloudFront Distribution ID**:
   ```bash
   aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='AiEstimationSite'].Id"
   ```

2. **Update CloudFront Distribution**:
   - Go to AWS Console → CloudFront
   - Click your distribution
   - Click "Edit"
   - Add to "Alternate Domain Names (CNAMEs)":
     - `ai-estimation.co.uk`
     - `www.ai-estimation.co.uk`
   - Select your SSL certificate
   - Save changes

3. **Create Route 53 Records**:
   ```bash
   # Create A record for apex domain
   aws route53 change-resource-record-sets \
     --hosted-zone-id YOUR_ZONE_ID \
     --change-batch '{
       "Changes": [{
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "ai-estimation.co.uk",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2",
             "DNSName": "d3elwe2avy3lk3.cloudfront.net",
             "EvaluateTargetHealth": false
           }
         }
       }]
     }'
   ```

---

## Troubleshooting

### Issue 1: SSL Certificate Pending Validation

**Symptom**: Certificate stuck in "Pending validation" status

**Solution**:
1. Check Route 53 for CNAME validation records
2. If missing, manually add them from ACM console
3. Wait 5-10 minutes

---

### Issue 2: Domain Shows "Server Not Found"

**Symptom**: Domain doesn't resolve

**Solution**:
1. Check Route 53 records exist
2. Verify nameservers are correct
3. Wait for DNS propagation (up to 48 hours, usually 5-60 minutes)

---

### Issue 3: SSL Certificate Error

**Symptom**: Browser shows "Your connection is not private"

**Solution**:
1. Verify certificate is in **us-east-1** region
2. Check certificate includes your domain name
3. Verify CloudFront is using the correct certificate

---

### Issue 4: OAuth Redirect Fails

**Symptom**: After GitHub login, error about redirect URI

**Solution**:
1. Update GitHub OAuth callback URL to new domain
2. Update NEXTAUTH_URL in environment variables
3. Redeploy application

---

## Verification Checklist

- [ ] Domain registered in Route 53
- [ ] SSL certificate requested in us-east-1
- [ ] SSL certificate validated (DNS)
- [ ] SST config updated with domain
- [ ] Environment variables updated
- [ ] GitHub OAuth callback updated
- [ ] Application deployed
- [ ] DNS propagated
- [ ] HTTPS works (green padlock)
- [ ] OAuth login works
- [ ] All pages load correctly

---

## Quick Reference

**Domain**: ai-estimation.co.uk  
**SSL Region**: us-east-1 (required for CloudFront)  
**OAuth Callback**: https://ai-estimation.co.uk/api/auth/callback/github  
**NEXTAUTH_URL**: https://ai-estimation.co.uk

**Commands**:
```bash
# Deploy with custom domain
sst deploy --stage production

# Check DNS
nslookup ai-estimation.co.uk

# View CloudFront distributions
aws cloudfront list-distributions

# Check certificate status
aws acm list-certificates --region us-east-1
```

---

## Cost Implications

**Route 53**:
- Hosted zone: $0.50/month
- DNS queries: $0.40 per million queries

**CloudFront**:
- No additional cost for custom domain
- Same data transfer pricing

**ACM (SSL Certificate)**:
- **FREE** for AWS services

**Total additional cost**: ~$0.50-1.00/month

---

## Next Steps After Domain Setup

1. **Update all documentation** with new domain
2. **Test all features** on custom domain
3. **Set up www redirect** (optional)
4. **Configure email** (optional, for contact forms)
5. **Set up monitoring** for domain health

---

**Created**: 2026-01-06  
**Task**: Custom Domain Configuration  
**Status**: Ready to Execute
