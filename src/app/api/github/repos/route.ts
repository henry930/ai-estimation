import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit, mockRepos } from '@/lib/github';
// import { getServerSession } from 'next-auth'; // Commented out until Auth is fully ready
// import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // const session = await getServerSession(authOptions);
        // const token = session?.user?.githubToken;

        // TEMPORARY: Use env var or mock for now since Phase 2 is pending/incomplete
        const token = process.env.GITHUB_ACCESS_TOKEN;

        const octokit = getOctokit(token);

        if (!octokit) {
            // Return Mock Data if no token
            return successResponse(mockRepos);
        }

        try {
            const { data } = await octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 20
            });
            return successResponse(data);
        } catch (apiError) {
            console.error('GitHub API Error:', apiError);
            // Fallback to mock on error (optional, maybe better to return error, but for dev smoothness we fallback)
            return successResponse(mockRepos);
        }

    } catch (error) {
        console.error('Repos List Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
