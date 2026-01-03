import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Octokit } from '@octokit/rest';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    console.log('[Sync] Starting sync process...');
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return errorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const { projectId, repoFullName } = body;

        const octokit = new Octokit({
            auth: session.accessToken
        });

        let project;
        if (projectId) {
            project = await prisma.project.findUnique({
                where: { id: projectId }
            });
        }

        const fullRepoName = repoFullName || project?.githubUrl?.split('github.com/')[1];
        if (!fullRepoName) {
            return errorResponse('No repository associated with this project', 400);
        }

        const [owner, repo] = fullRepoName.split('/');
        console.log(`[Sync] Repository: ${owner}/${repo}`);

        // 1. Fetch TASKS.md from GitHub
        let content = '';
        try {
            const { data: fileData }: any = await octokit.repos.getContent({
                owner,
                repo,
                path: 'TASKS.md'
            });
            content = Buffer.from(fileData.content, 'base64').toString('utf8');
        } catch (err) {
            return errorResponse('TASKS.md not found in repository', 404);
        }

        // 2. Ensure project exists
        if (!project) {
            project = await prisma.project.create({
                data: {
                    name: repo,
                    githubUrl: `https://github.com/${fullRepoName}`,
                    userId: session.user.id,
                    status: 'active'
                }
            });
        }

        const githubBaseUrl = `https://github.com/${fullRepoName}`;

        function convertToGitHubUrl(url: string, githubBaseUrl: string | null): string {
            if (!githubBaseUrl || !url.startsWith('file:///')) return url;
            const baseUrl = githubBaseUrl.endsWith('/') ? githubBaseUrl : `${githubBaseUrl}/`;
            const repoPath = 'blob/main/';
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            if (url.includes('/docs/')) return `${baseUrl}${repoPath}docs/${filename}`;
            return `${baseUrl}${repoPath}${filename}`;
        }

        // 3. Clear existing summary data if any
        const summaryMatch = content.match(/## Summary Progress Bar([\s\S]*)/);
        const mainContent = summaryMatch ? content.split('## Summary Progress Bar')[0] : content;

        // 4. Parse Refinements
        const refinements: Record<string, any> = {};
        const refinementBlocks = mainContent.split(/#### /).slice(1);
        for (const block of refinementBlocks) {
            const lines = block.split('\n');
            const header = lines[0].trim();
            const titleMatch = header.match(/^([^(]+)/);
            if (!titleMatch) continue;

            const title = titleMatch[1].trim().replace(/ Refinement$/, '');
            const blockContent = lines.slice(1).join('\n');

            refinements[title] = {
                description: blockContent.match(/\*\*Description\*\*: ([^\n]+)/)?.[1]?.trim(),
                prompt: blockContent.match(/\*\*AI Enquiry Prompt\*\*: ([^\n]+)/)?.[1]?.trim().replace(/^"|"$/g, ''),
                issues: blockContent.match(/\*\*Issues\*\*:(?:[ \t]*\n)?([\s\S]*?)(?=\n- \*\*|\n---|####|$)/)?.[1]?.trim(),
                documents: blockContent.match(/\*\*Documents\*\*:(?:[ \t]*\n)?([\s\S]*?)(?=\n- \*\*|\n---|####|$)/)?.[1]?.trim()
            };
        }

        // 5. Parse Phases
        const phases = mainContent.split(/## Phase \d+:/).slice(1);
        let groupOrder = 0;

        for (let i = 0; i < phases.length; i++) {
            const phaseContent = phases[i];
            // Split into lines and find the table
            const lines = phaseContent.split('\n');
            const tableRows = lines.filter(l =>
                l.includes('|') &&
                !l.includes('---') &&
                !l.toLowerCase().includes('task group') &&
                !l.toLowerCase().includes('progress') // Avoid summary table if it leaked in
            );

            console.log(`[Sync] Phase ${i + 1} has ${tableRows.length} rows`);

            for (const row of tableRows) {
                const cols = row.split('|').map(c => c.trim()).filter(Boolean);
                if (cols.length < 3) continue;

                const groupTitle = cols[0];
                const status = cols[1];
                const hours = parseInt(cols[2]) || 0;
                const branch = cols[3]?.replace(/`/g, '') || null;
                const detail = cols[4] || '';

                console.log(`[Sync] Processing Group: ${groupTitle}`);

                // Upsert TaskGroup
                const existingGroup = await prisma.taskGroup.findFirst({
                    where: { projectId: project.id, title: groupTitle }
                });

                const taskGroup = await prisma.taskGroup.upsert({
                    where: { id: existingGroup?.id || 'new-group-placeholder' },
                    update: { order: groupOrder },
                    create: {
                        projectId: project.id,
                        title: groupTitle,
                        order: groupOrder
                    }
                });

                // Upsert Task (linked to group)
                const ref = refinements[groupTitle];
                const existingTask = await prisma.task.findFirst({
                    where: { groupId: taskGroup.id, title: groupTitle }
                });

                const task = await prisma.task.upsert({
                    where: { id: existingTask?.id || 'new-task-placeholder' },
                    update: {
                        status: status as any,
                        hours: hours,
                        branch: branch,
                        description: ref?.description || detail,
                        aiPrompt: ref?.prompt || null,
                        issues: ref?.issues || null,
                    },
                    create: {
                        groupId: taskGroup.id,
                        title: groupTitle,
                        status: status as any,
                        hours: hours,
                        branch: branch,
                        description: ref?.description || detail,
                        aiPrompt: ref?.prompt || null,
                        issues: ref?.issues || null,
                        order: 0
                    }
                });

                // Clear/Update Subtasks and Documents
                const issuesText = ref?.issues || '';
                const docsText = ref?.documents || '';

                if (issuesText || docsText) {
                    await prisma.subTask.deleteMany({ where: { taskId: task.id } });
                    await prisma.taskDocument.deleteMany({ where: { taskId: task.id } });

                    if (issuesText) {
                        const subLines = issuesText.split('\n').filter(l => l.trim());
                        let subOrder = 0;
                        for (const sl of subLines) {
                            const subMatch = sl.match(/- \[( |x|X)\] (.*)/);
                            if (subMatch) {
                                await prisma.subTask.create({
                                    data: {
                                        taskId: task.id,
                                        title: subMatch[2].trim(),
                                        isCompleted: subMatch[1].toLowerCase() === 'x',
                                        order: subOrder++
                                    }
                                });
                            }
                        }
                    }

                    if (docsText) {
                        const docLines = docsText.split('\n').filter(l => l.trim());
                        for (const dl of docLines) {
                            const docMatch = dl.match(/\[([^\]]+)\]\(([^)]+)\)/);
                            if (docMatch) {
                                const rawUrl = docMatch[2].trim();
                                const convertedUrl = convertToGitHubUrl(rawUrl, githubBaseUrl);
                                await prisma.taskDocument.create({
                                    data: {
                                        taskId: task.id,
                                        title: docMatch[1].trim(),
                                        url: convertedUrl,
                                        type: convertedUrl.endsWith('.md') ? 'markdown' : 'link'
                                    }
                                });
                            }
                        }
                    }
                }
                groupOrder++;
            }
        }

        await prisma.project.update({
            where: { id: project.id },
            data: { lastSync: new Date() }
        });

        console.log('[Sync] Sync completed successfully.');
        return successResponse({ project, message: 'Project synced successfully' });
    } catch (error) {
        console.error('[Sync] Fatal Error:', error);
        return errorResponse('Failed to sync project', 500);
    }
}
