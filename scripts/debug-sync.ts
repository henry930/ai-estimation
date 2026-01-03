import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debug() {
    const projectId = 'cmjyeyyj7000z137qkjj2wihy'; // Copied from subagent report
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            taskGroups: {
                include: {
                    tasks: {
                        include: { subtasks: true }
                    }
                }
            }
        }
    });

    if (!project) {
        console.log('Project not found');
        return;
    }

    console.log(`Project: ${project.name}`);
    console.log(`Groups Count: ${project.taskGroups.length}`);

    project.taskGroups.forEach(group => {
        console.log(`- Group: ${group.title}, Tasks: ${group.tasks.length}`);
        group.tasks.forEach(task => {
            console.log(`  - Task: ${task.title}, Subtasks: ${task.subtasks.length}`);
        });
    });
}

debug().catch(console.error).finally(() => prisma.$disconnect());
