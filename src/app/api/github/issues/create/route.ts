import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getOctokit, createIssue } from '@/lib/github';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId } = body;

        if (!projectId) {
            return errorResponse('Missing projectId', 400);
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                estimations: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!project || !project.githubUrl) {
            return errorResponse('Project not found or not connected to GitHub', 404);
        }

        const estimation = project.estimations[0];
        if (!estimation) return errorResponse('No estimation found', 404);

        const tasks = typeof estimation.tasks === 'string'
            ? JSON.parse(estimation.tasks)
            : estimation.tasks || [];

        // Parse Owner/Repo
        // Assuming githubUrl is https://github.com/owner/repo
        const urlParts = project.githubUrl.split('/');
        const repo = urlParts.pop();
        const owner = urlParts.pop();

        if (!owner || !repo) {
            return errorResponse('Invalid GitHub URL', 400);
        }

        const token = process.env.GITHUB_ACCESS_TOKEN;
        const octokit = getOctokit(token);

        let createdCount = 0;

        if (octokit) {
            // Create Issues
            for (const task of tasks) {
                // Logic: Create issue for main task. Subtasks as checklist in body.
                let description = `**Estimated Hours**: ${task.hours}\n\n`;

                if (task.subtasks && task.subtasks.length > 0) {
                    description += `### Subtasks\n`;
                    task.subtasks.forEach((sub: any) => {
                        description += `- [ ] ${sub.title} (${sub.hours}h)\n`;
                    });
                }

                try {
                    await createIssue(octokit, owner, repo, task.title, description, ['estimation-task']);
                    createdCount++;
                    // Rate limit protection (simple)
                    await new Promise(r => setTimeout(r, 500));
                } catch (e) {
                    console.error(`Failed to create issue for task: ${task.title}`, e);
                }
            }
        } else {
            // Mock Mode
            console.log(`Mocking creation of ${tasks.length} issues for ${owner}/${repo}`);
            createdCount = tasks.length;
        }

        return successResponse({
            message: `Successfully created ${createdCount} issues.`,
            count: createdCount
        });

    } catch (error) {
        console.error('Issue Creation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
