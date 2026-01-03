import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany({
        where: { name: 'AI Estimation System' },
        select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
                select: { taskGroups: true }
            }
        }
    });
    console.log(JSON.stringify(projects, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
