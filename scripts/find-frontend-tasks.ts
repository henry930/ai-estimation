import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findTask() {
    const parentTask = await prisma.task.findFirst({
        where: {
            title: {
                contains: 'Frontend development: Build GitHub-like issue interface',
                mode: 'insensitive'
            }
        },
        include: { children: true }
    });

    if (!parentTask) {
        console.log('❌ Task not found');
        return;
    }

    console.log(`✅ Found Parent Task: "${parentTask.title}" (ID: ${parentTask.id})`);
    console.log(`\n📋 Subtasks (${parentTask.children.length}):`);

    parentTask.children.forEach(child => {
        console.log(`- [${child.status}] ${child.title} (ID: ${child.id})`);
    });
}

findTask().catch(console.error).finally(() => prisma.$disconnect());
