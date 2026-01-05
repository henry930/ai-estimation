/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        unoptimized: true, // Required for S3/CloudFront deployment
    },
    eslint: {
        ignoreDuringBuilds: true, // Temporarily disable for deployment
    },
}

module.exports = nextConfig
