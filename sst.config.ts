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
            // Custom domain configuration
            domain: {
                name: "ai-estimation.co.uk",
                redirects: ["www.ai-estimation.co.uk"],
            },

            environment: {
                // Database - Hardcoded for production
                DATABASE_URL: "postgresql://aiestimation:AiEstimation2026@ai-estimation-db.cp8caqsqw2vz.eu-west-1.rds.amazonaws.com:5432/ai_estimation?sslmode=require",

                // NextAuth - Custom Domain
                NEXTAUTH_URL: "https://ai-estimation.co.uk",
                NEXTAUTH_SECRET: "WNffvEuHZqDhmPXtx1ng/3YEKQraxty983f/UzFN2fg=",

                // GitHub OAuth - Using your new credentials
                GITHUB_ID: "Ov23liP9U59tJvOLKHkt",
                GITHUB_SECRET: "b113a7ce39bf050d354f49e855a4909711f52a02",

                // OpenAI API (optional)
                OPENAI_API_KEY: "dummy-openai-key",

                // AWS Bedrock (Claude 3.5 Sonnet)
                BEDROCK_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
                BEDROCK_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
                BEDROCK_AWS_REGION: "eu-west-1",

                NODE_ENV: "production",
                AUTH_TRUST_HOST: "true",
            },
        });

        return {
            site: site.url,
            domain: site.domain,
        };
    },
});


