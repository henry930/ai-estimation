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

        // 7. Process Phases and Tasks
        // Clear existing groups to ensure strict alignment with TASKS.md hierarchy (Phase -> Task)
        // This prevents mixing old "Task as Group" records with new "Phase as Group" records.
        await prisma.taskGroup.deleteMany({ where: { projectId: project.id } });

        const phaseBlocks = mainContent.split(/(?=## Phase \d+:)/).filter(b => b.trim().startsWith('## Phase'));
        let groupOrder = 0;

        for (const phaseBlock of phaseBlocks) {
            const lines = phaseBlock.split('\n');
            // Extract Phase Title (e.g., "Phase 1: Foundation & Setup")
            const phaseTitleMatch = lines[0].match(/## (Phase \d+: .+)/);
            if (!phaseTitleMatch) continue;

            const phaseTitle = phaseTitleMatch[1].trim();
            const phaseObjective = lines.find(l => l.startsWith('**Objective**:'))?.split('**Objective**:')[1]?.trim() || null;

            // Extract Status Line: **Status**: DONE | **Total Hours**: 40 | **Branch**: `feature/phase-1-foundation`
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

            // Upsert TaskGroup (Phase)
            const existingGroup = await prisma.taskGroup.findFirst({
                where: { projectId: project.id, title: phaseTitle }
            });

            const taskGroup = await prisma.taskGroup.upsert({
                where: { id: existingGroup?.id || 'new-group-placeholder' },
                update: {
                    order: groupOrder,
                    objective: phaseObjective,
                    status: phaseStatus,
                    totalHours: phaseHours,
                    branch: phaseBranch
                },
                create: {
                    projectId: project.id,
                    title: phaseTitle,
                    objective: phaseObjective,
                    status: phaseStatus,
                    totalHours: phaseHours,
                    branch: phaseBranch,
                    order: groupOrder
                }
            });

            // Find the table in this phase block
            const tableRows = lines.filter(l =>
                l.includes('|') &&
                !l.includes('---') &&
                !l.toLowerCase().includes('task group') &&
                !l.toLowerCase().includes('progress') &&
                !l.trim().startsWith('**Status**') // Exclude the status line
            );

            let taskOrder = 0;
            for (const row of tableRows) {
                const cols = row.split('|').map(c => c.trim()).filter(Boolean);
                if (cols.length < 3) continue;

                // | Row Title (Task) | Status | Hours | Branch | Detail (Objective) |
                const taskTitle = cols[0];
                const status = cols[1];
                const hours = parseInt(cols[2]) || 0;
                const branch = cols[3]?.replace(/`/g, '') || null;
                const detail = cols[4] || '';

                // Upsert Task
                // We use the first column "Task Group" from markdown as the Task Title
                // We use the "Detail" column as the Task Objective/Description

                // Check for refinements for this specific task
                const ref = refinements[taskTitle];

                const existingTask = await prisma.task.findFirst({
                    where: { groupId: taskGroup.id, title: taskTitle }
                });

                const task = await prisma.task.upsert({
                    where: { id: existingTask?.id || 'new-task-placeholder' },
                    update: {
                        status: status as any,
                        hours: hours,
                        branch: branch,
                        description: ref?.description || detail,
                        objective: detail, // Explicitly set objective from Detail column
                        aiPrompt: ref?.prompt || null,
                        order: taskOrder
                    },
                    create: {
                        groupId: taskGroup.id,
                        title: taskTitle,
                        status: status as any,
                        hours: hours,
                        branch: branch,
                        description: ref?.description || detail,
                        objective: detail,
                        aiPrompt: ref?.prompt || null,
                        order: taskOrder
                    }
                });

                // Link GitHub Issues to Task
                // We match issues that have a label matching the branch or title
                const matchedIssues = githubIssues.filter(issue =>
                    issue.labels.some((l: any) => l.name === branch || l.name === taskTitle) ||
                    issue.title.includes(taskTitle)
                );

                // Clear/Update Subtasks and Documents
                await prisma.subTask.deleteMany({ where: { taskId: task.id } });
                await prisma.taskDocument.deleteMany({ where: { taskId: task.id } });

                // 1. Add subtasks from TASKS.md Refinements
                const issuesFromMd = ref?.issues || '';
                if (issuesFromMd) {
                    const subLines = issuesFromMd.split('\n').filter((l: string) => l.trim());
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

                // 2. Add matched real GitHub Issues as subtasks (if not already there)
                for (const gitIssue of matchedIssues) {
                    const issueTitle = `GitHub Issue #${gitIssue.number}: ${gitIssue.title}`;
                    const alreadyExists = issuesFromMd.includes(gitIssue.title);
                    if (!alreadyExists) {
                        await prisma.subTask.create({
                            data: {
                                taskId: task.id,
                                title: issueTitle,
                                isCompleted: gitIssue.state === 'closed',
                                order: 999 // Put github issues at the end
                            }
                        });
                    }
                }

                // 3. Add documents from TASKS.md Refinements
                const docsFromMd = ref?.documents || '';
                if (docsFromMd) {
                    const docLines = docsFromMd.split('\n').filter((l: string) => l.trim());
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

                // 4. Add documents from docs folder that match task keywords
                const matchedDocs = githubDocs.filter(doc =>
                    doc.name.toLowerCase().includes(taskTitle.toLowerCase().replace(/\s+/g, '-')) ||
                    (branch && doc.name.toLowerCase().includes(branch.split('/')[1] || branch))
                );

                for (const gitDoc of matchedDocs) {
                    const alreadyExists = docsFromMd.includes(gitDoc.name);
                    if (!alreadyExists) {
                        await prisma.taskDocument.create({
                            data: {
                                taskId: task.id,
                                title: gitDoc.name,
                                url: gitDoc.html_url,
                                type: 'markdown'
                            }
                        });
                    }
                }

                taskOrder++;
            }
            groupOrder++;
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
