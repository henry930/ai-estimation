import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmjwgqf0m0002107615qq5nli';
    const groups = await prisma.taskGroup.findMany({
        where: { projectId },
        include: {
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    hours: true
                }
            }
        },
        orderBy: { order: 'asc' }
    });

    console.log(JSON.stringify(groups, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
