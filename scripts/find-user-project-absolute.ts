import { PrismaClient } from '@prisma/client';
import * as path from 'path';

async function main() {
    const root = process.cwd();
    const absolutePath = path.join(root, 'prisma', 'dev.db');
    const url = `file:${absolutePath}`;

    console.log(`Searching in absolute path: ${url}`);
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });

    try {
        const project = await prisma.project.findUnique({
            where: { id: 'cmjwgqf1g00061076dco4w0dh' }
        });
        if (project) {
            console.log(`FOUND PROJECT!`);
            console.log(JSON.stringify(project, null, 2));
        } else {
            console.log(`Project not found.`);
            const count = await prisma.project.count();
            console.log(`Total projects: ${count}`);
            if (count > 0) {
                const latest = await prisma.project.findFirst({ orderBy: { createdAt: 'desc' } });
                console.log(`Latest project: ${latest?.id} (${latest?.name})`);
            }
        }
    } catch (e: any) {
        console.error(`Error:`, e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
