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

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        const octokit = new Octokit({
            auth: session.accessToken
        });

        const { data: issues } = await octokit.issues.listForRepo({
            owner,
            repo,
            state: 'all',
            per_page: 100
        });

        return NextResponse.json({ success: true, data: issues });
    } catch (error) {
        console.error('GitHub Issues API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
    }
}
