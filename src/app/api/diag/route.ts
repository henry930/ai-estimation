import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'Connected').catch((err: any) => `Error: ${err.message}`);

        const envs = {
            buildId: "BUILD_" + Math.random().toString(36).substring(7),
            timestamp: "2026-01-06T21:18:00Z",
            hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasGithubId: !!process.env.GITHUB_ID,
            hasGithubSecret: !!process.env.GITHUB_SECRET,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
            authTrustHost: process.env.AUTH_TRUST_HOST,
            nextAuthUrlValue: process.env.NEXTAUTH_URL,
            githubIdValue: process.env.GITHUB_ID?.substring(0, 5) + "...",
        };

        const response = NextResponse.json({
            success: true,
            dbStatus,
            envs
        });

        // Force no-cache
        response.headers.set('Cache-Control', 'no-store, max-age=0');
        return response;
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}
