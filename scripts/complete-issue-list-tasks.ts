import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeTasks() {
    const taskTitles = [
        'Implement Issue Listing',
        'Implement Filtering',
        'Implement Search',
        'UI Structure & Basic Styling'
    ];

    const tasks = await prisma.task.findMany({
        where: {
            title: { in: taskTitles }
        }
    });

    console.log(`Found ${tasks.length} tasks to update.`);

    for (const task of tasks) {
        await prisma.task.update({
            where: { id: task.id },
            data: { status: 'DONE' }
        });
        console.log(`✅ Marked "${task.title}" as DONE`);
    }
}

completeTasks().catch(console.error).finally(() => prisma.$disconnect());
