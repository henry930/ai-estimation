import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DATABASE DUMP ---');

    const projects = await prisma.project.findMany({
        include: {
            taskGroups: {
                include: {
                    tasks: {
                        include: {
                            subtasks: true,
                            documents: true
                        }
                    }
                }
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
