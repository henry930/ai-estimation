const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const project = await prisma.project.findFirst({
            where: { name: 'AI Estimation System' }
        });

        if (!project) {
            console.log('Project not found');
            return;
        }

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

        console.log('Successfully fetched groups:', taskGroups.length);
        console.log('First group tasks count:', taskGroups[0].tasks.length);
    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
