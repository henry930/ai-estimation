import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'henry930@gmail.com' }
    });

    if (!user) {
        console.error('User Henry not found');
        return;
    }

    const project = await prisma.project.findFirst({
        where: { name: 'AI Estimation System' }
    });

    if (!project) {
        console.error('Project not found');
        return;
    }

    const updated = await prisma.project.update({
        where: { id: project.id },
        data: { userId: user.id }
    });

    console.log('Project transferred to Henry successfully:', updated);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
