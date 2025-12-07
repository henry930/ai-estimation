import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit } from '@/lib/github';
import { generateReadme } from '@/lib/readme-generator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId } = body;

        if (!projectId) {
            return errorResponse('Missing projectId', 400);
        }

        // 1. Fetch Data
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                estimations: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!project) return errorResponse('Project not found', 404);

        const estimation = project.estimations[0];
        if (!estimation) return errorResponse('No estimation found for project', 404);

        // 2. Generate Content
        const content = generateReadme(project, estimation);
        const encodedContent = Buffer.from(content).toString('base64');

        // 3. Commit to GitHub
        const token = process.env.GITHUB_ACCESS_TOKEN;
        const octokit = getOctokit(token);

        if (octokit && project.githubUrl) {
            // Extract owner/repo from URL or store them separately. 
            // For now, let's assume standard github url format keying off the stored URL is risky without parsing.
            // Better to rely on what we just created or store owner/repo in DB.
            // Assuming we stored `githubRepoId` isn't enough for Octokit calls which need owner/repo names.
            // Let's parse from `githubUrl` e.g. https://github.com/owner/repo

            try {
                const urlParts = project.githubUrl.split('/');
                const repo = urlParts.pop();
                const owner = urlParts.pop();

                if (!owner || !repo) throw new Error('Invalid GitHub URL format');

                // Check if file exists to get SHA (for update)
                let sha: string | undefined;
                try {
                    const { data: existingFile } = await octokit.repos.getContent({
                        owner,
                        repo,
                        path: 'README.md'
                    });
                    if (!Array.isArray(existingFile)) {
                        sha = existingFile.sha;
                    }
                } catch (e) {
                    // File doesn't exist, ignore
                }

                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: 'README.md',
                    message: 'docs: update README with AI estimation details',
                    content: encodedContent,
                    sha
                });

            } catch (apiError) {
                console.error('GitHub Commit Error:', apiError);
                // Don't fail the whole request if just the commit fails (maybe return warning)
                return errorResponse('Failed to commit to GitHub', 500);
            }
        } else {
            // Mock Mode
            console.log('Mocking README commit...');
            console.log('Generated Content Preview:\n', content.substring(0, 100) + '...');
        }

        return successResponse({
            message: 'README generated and committed (or mocked).',
            preview: content
        });

    } catch (error) {
        console.error('README Generation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
