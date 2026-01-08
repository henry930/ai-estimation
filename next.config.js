const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
    images: {
        unoptimized: true, // Required for S3/CloudFront deployment
    },
    eslint: {
        ignoreDuringBuilds: true, // Temporarily disable for deployment
    },
    // Fix for slow performance: force Next.js to only look at this directory as the root
    ...(process.env.NODE_ENV === 'production' ? { outputFileTracingRoot: path.join(__dirname) } : {}),
}

module.exports = nextConfig
