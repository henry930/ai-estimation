import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const taskId = 'cmjwgqf1g00061076dco4w0dh';
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            group: {
                include: {
                    project: true
                }
            }
        }
    });

    if (task) {
        console.log('FOUND TASK!');
        console.log(JSON.stringify(task, null, 2));
    } else {
        console.log('Task not found.');
        const count = await prisma.task.count();
        console.log(`Total tasks in DB: ${count}`);
        const latest = await prisma.task.findFirst({ orderBy: { createdAt: 'desc' } });
        console.log(`Latest task ID: ${latest?.id} (${latest?.title})`);

        // Let's also list some tasks to see the pattern
        const someTasks = await prisma.task.findMany({ take: 5 });
        console.log('Some task IDs:', someTasks.map(t => t.id));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
