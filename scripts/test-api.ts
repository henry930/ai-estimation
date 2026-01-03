import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing Project.findFirst...');
        const project = await prisma.project.findFirst({
            where: { name: 'AI Estimation System' },
            include: { documents: true }
        });
        console.log('Project found ID:', project?.id);
        console.log('Project githubUrl:', project?.githubUrl);

        if (project) {
            console.log('Testing TaskGroup.findMany...');
            const taskGroups = await prisma.taskGroup.findMany({
                where: { projectId: project.id },
                include: {
                    tasks: {
                        include: {
                            subtasks: {
                                orderBy: { order: 'asc' }
                            }
                        },
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            });
            console.log('Task groups found:', taskGroups.length);
        }
    } catch (err) {
        console.error('DIAGNOSTIC FAILED:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
