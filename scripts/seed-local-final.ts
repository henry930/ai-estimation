
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedLocal() {
    console.log('🌱 Starting local seed (Schema Final - Docs Sync)...');

    let user = await prisma.user.findUnique({ where: { email: 'henry930@gmail.com' } });
    if (!user) {
        user = await prisma.user.findFirst();
    }

    if (!user) {
        console.error('❌ No user found in DB. Cannot seed.');
        return;
    }
    console.log(`👤 Seeding for user: ${user.email} (${user.id})`);

    // 1. Find or create Project
    let project = await prisma.project.findFirst({
        where: { name: 'AI Estimation System' }
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                userId: user.id,
                name: 'AI Estimation System',
                description: 'AI-powered project estimation with GitHub integration',
                githubUrl: 'https://github.com/henry930/ai-estimation',
            }
        });
        console.log(`🆕 Created new project: ${project.name}`);
    }

    // Update owner to the current user we are seeding for
    project = await prisma.project.update({
        where: { id: project.id },
        data: { userId: user.id }
    });

    // 2. Read TASKS.md from .dashboard/docs structure
    const tasksPath = path.join(process.cwd(), '.dashboard', 'docs', 'tasks.md');

    if (!fs.existsSync(tasksPath)) {
        console.error(`❌ TASKS.md not found at ${tasksPath}`);
        return;
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');

    // 3. Clear existing groups/tasks
    console.log('🧹 Clearing old groups...');
    await prisma.taskGroup.deleteMany({ where: { projectId: project.id } });

    // 4. Parse Refinements 
    const summaryMatch = content.match(/## Summary Progress Bar([\s\S]*)/);
    const mainContent = summaryMatch ? content.split('## Summary Progress Bar')[0] : content;

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

    // 5. Process Phases and Tasks
    const phaseBlocks = mainContent.split(/(?=## Phase \d+:)/).filter(b => b.trim().startsWith('## Phase'));
    let groupOrder = 0;

    for (const phaseBlock of phaseBlocks) {
        const lines = phaseBlock.split('\n');
        const phaseTitleMatch = lines[0].match(/## (Phase \d+: .+)/);
        if (!phaseTitleMatch) continue;

        const phaseTitle = phaseTitleMatch[1].trim();
        const phaseObjective = lines.find(l => l.startsWith('**Objective**:'))?.split('**Objective**:')[1]?.trim() || null;

        // Extract Status Line
        const statusLine = lines.find(l => l.trim().startsWith('**Status**:'));
        let phaseStatus = null;
        let phaseHours = 0;
        let phaseBranch = null;

        if (statusLine) {
            const parts = statusLine.split('|');
            for (const part of parts) {
                if (part.includes('Status')) phaseStatus = part.split(':')[1].trim().replace(/\*\*/g, '');
                if (part.includes('Total Hours')) phaseHours = parseInt(part.split(':')[1].trim()) || 0;
                if (part.includes('Branch')) phaseBranch = part.split(':')[1].trim().replace(/`/g, '');
            }
        }

        console.log(`➡️  Processing Group: ${phaseTitle} [${phaseStatus}]`);

        const taskGroup = await prisma.taskGroup.create({
            data: {
                projectId: project.id,
                title: phaseTitle,
                objective: phaseObjective,
                status: phaseStatus,
                totalHours: phaseHours,
                branch: phaseBranch,
                order: groupOrder
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
            const detail = cols[4] || ''; // This is the objective/detail

            const ref = refinements[taskTitle];

            const task = await prisma.task.create({
                data: {
                    groupId: taskGroup.id,
                    title: taskTitle,
                    status: status as any,
                    hours: hours,
                    branch: branch,
                    description: ref?.description || detail,
                    objective: detail, // Ensuring Objective is always populated from Detail
                    aiPrompt: ref?.prompt || null,
                    order: taskOrder
                }
            });

            if (ref?.issues) {
                const subLines = ref.issues.split('\n').filter((l: string) => l.trim());
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
            taskOrder++;
        }
        groupOrder++;
    }

    console.log('✨ Seed Final (Docs) completed successfully!');
}

seedLocal()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
