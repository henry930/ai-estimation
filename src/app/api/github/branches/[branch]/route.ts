import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ branch: string }> }
) {
    const { branch } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    try {
        // Get user's GitHub token
        const octokit = new Octokit({
            auth: session.accessToken,
        });

        // Get branch information
        const { data: branchData } = await octokit.repos.getBranch({
            owner,
            repo,
            branch,
        });

        // Get comparison with main branch
        let comparison;
        try {
            const { data: compareData } = await octokit.repos.compareCommits({
                owner,
                repo,
                base: 'main',
                head: branch,
            });
            comparison = compareData;
        } catch (error) {
            // Branch might be main itself or comparison failed
            comparison = null;
        }

        // Determine status
        let status: 'merged' | 'ahead' | 'behind' | 'synced' = 'synced';
        let commitsAhead = 0;
        let commitsBehind = 0;

        if (comparison) {
            commitsAhead = comparison.ahead_by;
            commitsBehind = comparison.behind_by;

            if (comparison.status === 'identical') {
                status = 'synced';
            } else if (commitsBehind > 0 && commitsAhead === 0) {
                status = 'behind';
            } else if (commitsAhead > 0) {
                status = 'ahead';
            }
        }

        // Check if branch is merged
        try {
            const { data: pulls } = await octokit.pulls.list({
                owner,
                repo,
                head: `${owner}:${branch}`,
                state: 'closed',
            });

            const mergedPR = pulls.find(pr => pr.merged_at);
            if (mergedPR) {
                status = 'merged';
            }
        } catch (error) {
            // Ignore errors checking for merged PRs
        }

        return NextResponse.json({
            name: branch,
            status,
            commitsAhead,
            commitsBehind,
            lastCommit: branchData.commit.commit.message.split('\n')[0],
            githubUrl: `https://github.com/${owner}/${repo}/tree/${branch}`,
        });
    } catch (error: any) {
        console.error('Error fetching branch info:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch branch info' },
            { status: 500 }
        );
    }
}
