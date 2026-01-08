import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!project) {
        console.log('No project found');
        return;
    }

    console.log('Latest Project:', project.id, project.name);

    // Set some strategic "Master Instructions"
    const masterInstructions = `
    MASTER PROTOCOL:
    1. We are a "Security-First" project. Every implementation plan MUST include a "Security & Compliance" section.
    2. We use a "Micro-Frontend" architecture. Any UI restructuring must separate components into independent modules.
    3. Estimated hours MUST include a 20% "Quality Buffer".
    `;

    await prisma.project.update({
        where: { id: project.id },
        data: { aiInstructions: masterInstructions }
    });

    console.log('Project AI Instructions updated successfully.');
}

main().finally(() => prisma.$disconnect());
