import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Current DATABASE_URL in env:', process.env.DATABASE_URL);

    // Check both common paths
    const paths = ['file:./dev.db', 'file:./prisma/dev.db'];

    for (const path of paths) {
        console.log(`\nSearching in ${path}...`);
        const prisma = new PrismaClient({
            datasources: { db: { url: path } }
        });

        try {
            const project = await prisma.project.findUnique({
                where: { id: 'cmjwgqf1g00061076dco4w0dh' }
            });
            if (project) {
                console.log(`FOUND PROJECT in ${path}!`);
                console.log(JSON.stringify(project, null, 2));
            } else {
                console.log(`Project not found in ${path}.`);
                const count = await prisma.project.count();
                console.log(`Total projects in this DB: ${count}`);
                if (count > 0) {
                    const latest = await prisma.project.findFirst({ orderBy: { createdAt: 'desc' } });
                    console.log(`Latest project in this DB: ${latest?.id} (${latest?.name})`);
                }
            }
        } catch (e: any) {
            console.error(`Error querying ${path}:`, e.message);
        } finally {
            await prisma.$disconnect();
        }
    }
}

main();
