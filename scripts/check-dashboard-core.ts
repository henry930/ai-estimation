import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const task = await prisma.task.findFirst({
        where: { title: 'Dashboard Core' },
        include: {
            subtasks: true,
            documents: true
        }
    });
    console.log(JSON.stringify(task, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
