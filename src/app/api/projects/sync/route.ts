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

        // 1. Fetch repository details from GitHub
        let githubRepoId = '';
        let githubUrl = `https://github.com/${fullRepoName}`;
        try {
            const { data: repoData } = await octokit.repos.get({ owner, repo });
            githubRepoId = repoData.id.toString();
            githubUrl = repoData.html_url;
        } catch (err) {
            console.error('[Sync] Failed to fetch repo details from GitHub:', err);
            // Fallback to what we have if GitHub fetch fails (though it shouldn't if we have access)
        }

        // 2. Ensure project exists and is unique
        if (!project) {
            // Check by URL or GitHub ID
            project = await prisma.project.findFirst({
                where: {
                    userId: session.user.id,
                    OR: [
                        { githubUrl: githubUrl },
                        githubRepoId ? { githubRepoId: githubRepoId } : {}
                    ].filter(cond => Object.keys(cond).length > 0)
                }
            });

            if (!project) {
                project = await prisma.project.create({
                    data: {
                        name: repo,
                        githubUrl: githubUrl,
                        githubRepoId: githubRepoId || null,
                        userId: session.user.id,
                        status: 'active'
                    }
                });
            } else if (githubRepoId && !project.githubRepoId) {
                // Update existing project with missing repo ID
                project = await prisma.project.update({
                    where: { id: project.id },
                    data: { githubRepoId }
                });
            }
        } else if (githubRepoId && !project.githubRepoId) {
            // Update existing project with missing repo ID if found by ID but missing RepoId
            project = await prisma.project.update({
                where: { id: project.id },
                data: { githubRepoId }
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

        // 6. Fetch live GitHub Issues and Documents
        const { data: githubIssues } = await octokit.issues.listForRepo({
            owner,
            repo,
            state: 'all',
            per_page: 100
        });

        let githubDocs: any[] = [];
        try {
            const { data: docsContent } = await octokit.repos.getContent({
                owner,
                repo,
                path: 'docs'
            });
            githubDocs = Array.isArray(docsContent) ? docsContent : [];
        } catch (e) {
            console.log('[Sync] No docs folder found');
        }

        // 7. Process Phases and Tasks inside a single Transaction
        const updatedProjectData = await prisma.$transaction(async (tx) => {
            // Clear existing groups atomicly
            await tx.taskGroup.deleteMany({ where: { projectId: project.id } });

            const phaseBlocks = mainContent.split(/(?=## Phase \d+:)/).filter(b => b.trim().startsWith('## Phase'));
            let groupOrder = 0;

            for (const phaseBlock of phaseBlocks) {
                const lines = phaseBlock.split('\n');
                const phaseTitleMatch = lines[0].match(/## (Phase \d+: .+)/);
                if (!phaseTitleMatch) continue;

                const phaseTitle = phaseTitleMatch[1].trim();
                const phaseObjective = lines.find(l => l.startsWith('**Objective**:'))?.split('**Objective**:')[1]?.trim() || null;

                const statusLine = lines.find(l => l.trim().startsWith('**Status**:'));
                let phaseStatus = null;
                let phaseHours = 0;
                let phaseBranch = null;

                if (statusLine) {
                    const parts = statusLine.split('|');
                    for (const part of parts) {
                        if (part.includes('Status')) phaseStatus = part.split(':')[1].trim();
                        if (part.includes('Total Hours')) phaseHours = parseInt(part.split(':')[1].trim()) || 0;
                        if (part.includes('Branch')) phaseBranch = part.split(':')[1].trim().replace(/`/g, '');
                    }
                }

                const taskGroup = await tx.taskGroup.create({
                    data: {
                        projectId: project.id,
                        title: phaseTitle,
                        objective: phaseObjective,
                        status: phaseStatus,
                        totalHours: phaseHours,
                        branch: phaseBranch,
                        order: groupOrder++
                    }
                });

                const tableRows = lines.filter(l =>
                    l.includes('|') &&
                    !l.includes('---') &&
                    !l.toLowerCase().includes('task group') &&
                    !l.toLowerCase().includes('progress') &&
                    !l.trim().startsWith('**Status**')
                );

                let taskOrder = 0;
                for (const row of tableRows) {
                    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
                    if (cols.length < 3) continue;

                    const taskTitle = cols[0];
                    const status = cols[1];
                    const hours = parseInt(cols[2]) || 0;
                    const branch = cols[3]?.replace(/`/g, '') || null;
                    const detail = cols[4] || '';

                    const ref = refinements[taskTitle];

                    const task = await tx.task.create({
                        data: {
                            groupId: taskGroup.id,
                            title: taskTitle,
                            status: status as any,
                            hours: hours,
                            branch: branch,
                            description: ref?.description || detail,
                            objective: detail,
                            aiPrompt: ref?.prompt || null,
                            order: taskOrder++
                        }
                    });

                    // Collect all subtasks and docs for bulk creation
                    const subtasksToCreate = [];
                    const docsToCreate = [];

                    // 1. From TASKS.md refinements
                    const issuesFromMd = ref?.issues || '';
                    if (issuesFromMd) {
                        const subLines = issuesFromMd.split('\n').filter((l: string) => l.trim());
                        subLines.forEach((sl: string, i: number) => {
                            const subMatch = sl.match(/- \[( |x|X)\] (.*)/);
                            if (subMatch) {
                                subtasksToCreate.push({
                                    taskId: task.id,
                                    title: subMatch[2].trim(),
                                    isCompleted: subMatch[1].toLowerCase() === 'x',
                                    order: i
                                });
                            }
                        });
                    }

                    // 2. From GitHub Issues
                    const matchedIssues = githubIssues.filter(issue =>
                        issue.labels.some((l: any) => l.name === branch || l.name === taskTitle) ||
                        issue.title.includes(taskTitle)
                    );
                    matchedIssues.forEach(gitIssue => {
                        const issueTitle = `GitHub Issue #${gitIssue.number}: ${gitIssue.title}`;
                        if (!issuesFromMd.includes(gitIssue.title)) {
                            subtasksToCreate.push({
                                taskId: task.id,
                                title: issueTitle,
                                isCompleted: gitIssue.state === 'closed',
                                order: 999
                            });
                        }
                    });

                    // 3. Documents from MD
                    const docsFromMd = ref?.documents || '';
                    if (docsFromMd) {
                        const docLines = docsFromMd.split('\n').filter((l: string) => l.trim());
                        docLines.forEach(dl => {
                            const docMatch = dl.match(/\[([^\]]+)\]\(([^)]+)\)/);
                            if (docMatch) {
                                const rawUrl = docMatch[2].trim();
                                const convertedUrl = convertToGitHubUrl(rawUrl, githubBaseUrl);
                                docsToCreate.push({
                                    taskId: task.id,
                                    title: docMatch[1].trim(),
                                    url: convertedUrl,
                                    type: convertedUrl.endsWith('.md') ? 'markdown' : 'link'
                                });
                            }
                        });
                    }

                    // 4. Docs from GitHub docs/ folder
                    const matchedDocs = githubDocs.filter(doc =>
                        doc.name.toLowerCase().includes(taskTitle.toLowerCase().replace(/\s+/g, '-')) ||
                        (branch && doc.name.toLowerCase().includes(branch.split('/')[1] || branch))
                    );
                    matchedDocs.forEach(gitDoc => {
                        if (!docsFromMd.includes(gitDoc.name)) {
                            docsToCreate.push({
                                taskId: task.id,
                                title: gitDoc.name,
                                url: gitDoc.html_url,
                                type: 'markdown'
                            });
                        }
                    });

                    // Perform writes in parallel within the transaction
                    await Promise.all([
                        ...subtasksToCreate.map(st => tx.subTask.create({ data: st })),
                        ...docsToCreate.map(dt => tx.taskDocument.create({ data: dt }))
                    ]);
                }
            }

            return await tx.project.update({
                where: { id: project.id },
                data: { lastSync: new Date() }
            });
        }, {
            timeout: 30000 // Increase timeout for large syncs
        });

        console.log('[Sync] Sync completed successfully.');
        return successResponse({ project: updatedProjectData, message: 'Project synced successfully' });
    } catch (error) {
        console.error('[Sync] Fatal Error:', error);
        return errorResponse('Failed to sync project', 500);
    }
}
