import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit, mockFileTree } from '@/lib/github';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ owner: string; repo: string }> }
) {
    const { owner, repo } = await params;

    try {
        const token = process.env.GITHUB_ACCESS_TOKEN;
        const octokit = getOctokit(token);

        if (!octokit) {
            return successResponse({ tree: mockFileTree });
        }

        try {
            // Get the default branch first? Or assume 'main'/'master'.
            // For recursive tree, we need the SHA of the branch.
            // Simplified: list repo contents or get generic tree.

            // 1. Get default branch SHA
            const { data: repoData } = await octokit.repos.get({ owner, repo });
            const defaultBranch = repoData.default_branch;

            // 2. Get Tree recursively
            const { data: treeData } = await octokit.git.getTree({
                owner,
                repo,
                tree_sha: defaultBranch,
                recursive: '1'
            });

            return successResponse(treeData);

        } catch (apiError) {
            console.error('GitHub API Error:', apiError);
            return successResponse({ tree: mockFileTree });
        }

    } catch (error) {
        console.error('File Tree Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
