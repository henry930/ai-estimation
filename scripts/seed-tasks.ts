import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const tasksPath = path.join(process.cwd(), 'TASKS.md');
    const content = fs.readFileSync(tasksPath, 'utf-8');

    // Find the current project (most recently created one)
    const project = await prisma.project.findFirst({
        orderBy: { createdAt: 'desc' },
    });

    if (!project) {
        console.error('No project found to seed tasks for.');
        return;
    }

    console.log(`Seeding tasks for project: ${project.name} (${project.id})`);

    // Clear existing task groups for this project
    await prisma.taskGroup.deleteMany({
        where: { projectId: project.id },
    });

    const lines = content.split('\n');
    let currentGroup: any = null;
    let currentBranch = '';
    let groupOrder = 0;
    let taskOrder = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Match Phases (Task Groups)
        const groupMatch = trimmedLine.match(/^## (Phase \d+: .+)/);
        if (groupMatch) {
            const title = groupMatch[1].trim();
            currentGroup = await prisma.taskGroup.create({
                data: {
                    projectId: project.id,
                    title: title,
                    order: groupOrder++,
                },
            });
            console.log(`\nCreated Group: ${title}`);
            currentBranch = ''; // Reset branch for new phase
            taskOrder = 0;
            continue;
        }

        // Match Categories/Subheaders for branches - much more flexible regex
        // Looks for "Branch: `...`" at the end of a line
        const branchMatch = trimmedLine.match(/Branch: `(.+?)`/);
        if (branchMatch) {
            currentBranch = branchMatch[1];
            console.log(`  Found Branch context: ${currentBranch}`);
            // If it's just a category line without a task, we continue
            if (!trimmedLine.startsWith('- [')) continue;
        }

        // Match Tasks
        // Flexible hours match: "X hours", "X hour", "X-Y hours"
        const taskMatch = trimmedLine.match(/^- \[( |x)\] (.+?) - (\d+)(?:-\d+)? hours?/i);
        if (taskMatch && currentGroup) {
            const completed = taskMatch[1].toLowerCase() === 'x';
            const title = taskMatch[2].trim();
            const hours = parseInt(taskMatch[3]);

            await prisma.task.create({
                data: {
                    groupId: currentGroup.id,
                    title,
                    hours,
                    completed,
                    branch: currentBranch || null,
                    order: taskOrder++,
                },
            });
            // console.log(`    Added Task: ${title} (${hours}h) [${currentBranch || 'no branch'}]`);
        }
    }

    console.log('\nSeeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
