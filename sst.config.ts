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
        // TODO: Add RDS PostgreSQL database after VPC configuration
        // For now, deploying without database to get the app URL first
        // Then we can configure DATABASE_URL externally or add VPC-configured RDS

        // Create Next.js site
        const site = new sst.aws.Nextjs("AiEstimationSite", {
            environment: {
                // Database - will be configured separately
                DATABASE_URL: process.env.DATABASE_URL || "",

                // NextAuth - will be updated after first deployment
                NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",

                // GitHub OAuth
                GITHUB_ID: process.env.GITHUB_ID || "",
                GITHUB_SECRET: process.env.GITHUB_SECRET || "",

                // OpenAI API
                OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",

                // Stripe (optional)
                STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
                STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || "",
                STRIPE_TEAM_PRICE_ID: process.env.STRIPE_TEAM_PRICE_ID || "",
                STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

                NODE_ENV: "production",
            },
        });

        return {
            site: site.url,
        };
    },
});


