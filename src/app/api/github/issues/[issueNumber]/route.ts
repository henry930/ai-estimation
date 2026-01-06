
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ issueNumber: string }> }
) {
    try {
        const { issueNumber } = await params;
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

        const { data: issue } = await octokit.issues.get({
            owner,
            repo,
            issue_number: parseInt(issueNumber)
        });

        return NextResponse.json({ success: true, data: issue });
    } catch (error: any) {
        console.error('GitHub Single Issue API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch issue' }, { status: 500 });
    }
}
