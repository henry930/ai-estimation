import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit } from '@/lib/github';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return errorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const { projectId, repoName, isPrivate = true, description } = body;

        if (!repoName) {
            return errorResponse('Missing repoName', 400);
        }

        const token = session.accessToken || process.env.GITHUB_ACCESS_TOKEN;
        const octokit = getOctokit(token);

        let githubUrl = '';
        let githubRepoId = '';

        if (octokit) {
            try {
                const { data } = await octokit.repos.createForAuthenticatedUser({
                    name: repoName,
                    private: isPrivate,
                    description: description || `Created via AI Estimation for project: ${repoName}`
                });
                githubUrl = data.html_url;
                githubRepoId = data.id.toString();
            } catch (error: any) {
                console.error('GitHub API Error:', error);
                if (error.status === 422) {
                    return errorResponse('Repository name already exists', 422);
                }
                return errorResponse('Failed to create repository on GitHub', 500);
            }
        } else {
            // MOCK MODE
            console.log(`Mocking repo creation: ${repoName}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            githubUrl = `https://github.com/mock-user/${repoName}`;
            githubRepoId = `mock-${Date.now()}`;
        }

        // Project Data
        const projectData = {
            githubUrl,
            githubRepoId,
            name: repoName,
            description: description || null,
            userId: session.user.id,
            status: 'active'
        };

        let resultProject;
        if (projectId) {
            resultProject = await prisma.project.update({
                where: { id: projectId },
                data: projectData
            });
        } else {
            resultProject = await prisma.project.create({
                data: projectData
            });
        }

        return successResponse({
            project: resultProject,
            repoUrl: githubUrl
        });

    } catch (error) {
        console.error('Repo Creation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
