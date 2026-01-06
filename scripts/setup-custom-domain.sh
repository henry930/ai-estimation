#!/bin/bash

# Custom Domain Setup Script for ai-estimation.co.uk
# This script helps set up SSL certificate and verify domain configuration

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Custom Domain Setup - ai-estimation.co.uk              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

DOMAIN="ai-estimation.co.uk"
WWW_DOMAIN="www.ai-estimation.co.uk"
REGION="us-east-1"  # Required for CloudFront

# Step 1: Check if domain exists in Route 53
echo "🔍 Step 1: Checking Route 53 for domain..."
HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='${DOMAIN}.'].Id" --output text 2>/dev/null || echo "")

if [ -z "$HOSTED_ZONE" ]; then
    echo "❌ Domain ${DOMAIN} not found in Route 53"
    echo "   Please register the domain in Route 53 first"
    echo "   https://console.aws.amazon.com/route53/home#DomainListing:"
    exit 1
else
    echo "✅ Domain found in Route 53"
    echo "   Hosted Zone ID: ${HOSTED_ZONE}"
fi
echo ""

# Step 2: Check for existing SSL certificate
echo "🔍 Step 2: Checking for SSL certificate in ${REGION}..."
CERT_ARN=$(aws acm list-certificates --region ${REGION} \
    --query "CertificateSummaryList[?DomainName=='${DOMAIN}'].CertificateArn" \
    --output text 2>/dev/null || echo "")

if [ -z "$CERT_ARN" ]; then
    echo "⚠️  No SSL certificate found for ${DOMAIN}"
    echo ""
    echo "📝 To request a certificate, run:"
    echo ""
    echo "aws acm request-certificate \\"
    echo "  --domain-name ${DOMAIN} \\"
    echo "  --subject-alternative-names ${WWW_DOMAIN} \\"
    echo "  --validation-method DNS \\"
    echo "  --region ${REGION}"
    echo ""
    echo "Then:"
    echo "1. Go to AWS Console → Certificate Manager (us-east-1)"
    echo "2. Click 'Create records in Route 53' to auto-validate"
    echo "3. Wait 5-10 minutes for validation"
    echo "4. Run this script again"
    echo ""
    read -p "Would you like to request the certificate now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Requesting SSL certificate..."
        CERT_ARN=$(aws acm request-certificate \
            --domain-name ${DOMAIN} \
            --subject-alternative-names ${WWW_DOMAIN} \
            --validation-method DNS \
            --region ${REGION} \
            --query 'CertificateArn' \
            --output text)
        echo "✅ Certificate requested!"
        echo "   Certificate ARN: ${CERT_ARN}"
        echo ""
        echo "⏳ Now you need to validate the certificate:"
        echo "   1. Go to: https://console.aws.amazon.com/acm/home?region=us-east-1"
        echo "   2. Click on your certificate"
        echo "   3. Click 'Create records in Route 53'"
        echo "   4. Wait 5-10 minutes"
        echo ""
        exit 0
    else
        echo "❌ Certificate required to continue. Exiting..."
        exit 1
    fi
else
    echo "✅ SSL certificate found"
    echo "   Certificate ARN: ${CERT_ARN}"
    
    # Check certificate status
    CERT_STATUS=$(aws acm describe-certificate \
        --certificate-arn ${CERT_ARN} \
        --region ${REGION} \
        --query 'Certificate.Status' \
        --output text)
    
    echo "   Status: ${CERT_STATUS}"
    
    if [ "$CERT_STATUS" != "ISSUED" ]; then
        echo "⚠️  Certificate is not yet issued (Status: ${CERT_STATUS})"
        echo "   Please wait for validation to complete"
        echo "   Check: https://console.aws.amazon.com/acm/home?region=us-east-1"
        exit 1
    fi
fi
echo ""

# Step 3: Verify SST configuration
echo "🔍 Step 3: Verifying SST configuration..."
if grep -q "ai-estimation.co.uk" sst.config.ts; then
    echo "✅ SST config includes custom domain"
else
    echo "❌ SST config missing custom domain configuration"
    echo "   Please update sst.config.ts with domain configuration"
    exit 1
fi
echo ""

# Step 4: Verify environment variables
echo "🔍 Step 4: Verifying environment variables..."
if grep -q "https://ai-estimation.co.uk" .env.production; then
    echo "✅ NEXTAUTH_URL updated to custom domain"
else
    echo "⚠️  NEXTAUTH_URL not updated in .env.production"
    echo "   Please update NEXTAUTH_URL to: https://ai-estimation.co.uk"
fi
echo ""

# Step 5: Ready to deploy
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✅ Pre-deployment checks complete!                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Deploy to production:"
echo "   sst deploy --stage production"
echo ""
echo "2. Update GitHub OAuth callback URL to:"
echo "   https://ai-estimation.co.uk/api/auth/callback/github"
echo ""
echo "3. Wait for DNS propagation (5-60 minutes)"
echo ""
echo "4. Test the domain:"
echo "   https://ai-estimation.co.uk"
echo ""
echo "5. Verify SSL certificate (green padlock in browser)"
echo ""
echo "6. Test GitHub OAuth login"
echo ""

read -p "Ready to deploy now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    sst deploy --stage production
else
    echo "👍 Deployment skipped. Run 'sst deploy --stage production' when ready."
fi
