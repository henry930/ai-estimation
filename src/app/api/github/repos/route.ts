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

        const octokit = new Octokit({
            auth: session.accessToken
        });

        // Fetch user repositories
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50
        });

        const formattedRepos = repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            private: repo.private,
            updated: new Date(repo.updated_at || '').toLocaleDateString(),
            html_url: repo.html_url
        }));

        return NextResponse.json({ success: true, data: formattedRepos });
    } catch (error) {
        console.error('GitHub API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}
