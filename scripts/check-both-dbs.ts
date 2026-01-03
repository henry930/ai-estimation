import { PrismaClient } from '@prisma/client';

// We override the process.env.DATABASE_URL before initializing Prisma if possible, 
// but it's easier to just use a custom script that doesn't rely on the generated client's default URL if we can.
// Actually, Prisma client reads it at initialization.

async function checkDb(url: string) {
    console.log(`Checking DB at: ${url}`);
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });
    try {
        const projects = await prisma.project.findMany();
        console.log(JSON.stringify(projects, null, 2));
    } catch (e) {
        console.error(`Error checking ${url}:`, e);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await checkDb('file:./prisma/dev.db');
    await checkDb('file:./dev.db');
}

main();
