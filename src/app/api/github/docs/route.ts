import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');
        const path = searchParams.get('path') || 'docs';

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const octokit = new Octokit({
            auth: session.accessToken
        });

        try {
            const { data: content } = await octokit.repos.getContent({
                owner,
                repo,
                path
            });

            return NextResponse.json({ success: true, data: content });
        } catch (error: any) {
            if (error.status === 404) {
                return NextResponse.json({ success: true, data: [] });
            }
            throw error;
        }
    } catch (error) {
        console.error('GitHub Docs API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 });
    }
}
