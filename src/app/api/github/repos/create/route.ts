import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit } from '@/lib/github';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId, repoName, isPrivate = true } = body;

        if (!projectId || !repoName) {
            return errorResponse('Missing projectId or repoName', 400);
        }

        // Verify project owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return errorResponse('Project not found', 404);
        }

        // TEMPORARY: Use env var or mock
        const token = process.env.GITHUB_ACCESS_TOKEN;
        const octokit = getOctokit(token);

        let githubUrl = '';
        let githubRepoId = '';

        if (octokit) {
            try {
                const { data } = await octokit.repos.createForAuthenticatedUser({
                    name: repoName,
                    private: isPrivate,
                    description: `Created via AI Estimation for project: ${project.name}`
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

        // Update Project
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                githubUrl,
                githubRepoId,
                name: repoName // Optionally sync name if changed
            }
        });

        return successResponse({
            project: updatedProject,
            repoUrl: githubUrl
        });

    } catch (error) {
        console.error('Repo Creation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
