import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function syncTasks() {
    const tasksPath = path.join(process.cwd(), 'TASKS.md');
    const content = fs.readFileSync(tasksPath, 'utf8');

    // 1. Get or Create a default project for management
    let project = await prisma.project.findFirst();
    if (!project) {
        let user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found. Creating system user...');
            user = await prisma.user.create({
                data: {
                    name: 'System Admin',
                    email: 'admin@ai-estimation.local',
                }
            });
        }
        console.log('Creating management project...');
        project = await prisma.project.create({
            data: {
                name: 'AI Estimation System',
                description: 'Internal project management',
                userId: user.id,
                status: 'active'
            }
        });
    }

    console.log(`Syncing for project: ${project.name} (${project.id})`);

    // 2. Parse Phases
    const phases = content.split(/## Phase \d+:/).slice(1);

    // 3. Parse Refinements (for descriptions, prompts, issues)
    const refinements: Record<string, { description?: string, prompt?: string, issues?: string }> = {};
    const refinementMatches = content.matchAll(/#### ([^(]+)\(([^)]+)\)\n- \*\*Description\*\*: ([^\n]+)\n- \*\*AI Enquiry Prompt\*\*: ([^\n]+)\n- \*\*Issues\*\*: ([\s\S]*?)(?=####|---|$)/g);

    for (const match of refinementMatches) {
        const title = match[1].trim();
        refinements[title] = {
            description: match[3].trim(),
            prompt: match[4].trim().replace(/^"|"$/g, ''),
            issues: match[5].trim()
        };
    }

    let groupOrder = 0;
    for (let i = 0; i < phases.length; i++) {
        const phaseContent = phases[i];
        const phaseTitleMatch = content.match(new RegExp(`## Phase ${i + 1}: ([^\\n]+)`));
        const phaseTitle = phaseTitleMatch ? `Phase ${i + 1}: ${phaseTitleMatch[1].trim()}` : `Phase ${i + 1}`;

        console.log(`Processing ${phaseTitle}...`);

        // Find the table rows
        const tableRows = phaseContent.split('\n').filter(line => line.includes('|') && !line.includes('---') && !line.includes('Task Group'));

        for (const row of tableRows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean);
            if (cols.length < 3) continue;

            const groupTitle = cols[0];
            const status = cols[1];
            const hours = parseInt(cols[2]) || 0;
            const branch = cols[3]?.replace(/`/g, '') || null;
            const detail = cols[4] || '';

            // Upsert TaskGroup
            const taskGroup = await prisma.taskGroup.upsert({
                where: {
                    id: (await prisma.taskGroup.findFirst({ where: { projectId: project.id, title: groupTitle } }))?.id || 'temp-id'
                },
                update: { order: groupOrder },
                create: {
                    projectId: project.id,
                    title: groupTitle,
                    order: groupOrder
                }
            });

            // Extract Refinement data
            const ref = refinements[groupTitle];

            // Create/Update main task for the group (Simplified: one task per group in this view)
            await prisma.task.upsert({
                where: {
                    id: (await prisma.task.findFirst({ where: { groupId: taskGroup.id, title: groupTitle } }))?.id || 'temp-id'
                },
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

            groupOrder++;
        }
    }

    console.log('Sync completed successfully.');
}

syncTasks()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
