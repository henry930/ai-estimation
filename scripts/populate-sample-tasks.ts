import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateSampleTasks() {
    console.log('🌱 Populating sample flat tasks...\n');

    // Get the first project
    const project = await prisma.project.findFirst();

    if (!project) {
        console.error('❌ No project found. Please create a project first.');
        process.exit(1);
    }

    console.log(`📦 Adding tasks to project: ${project.name}\n`);

    // Clear existing tasks for this project
    await prisma.task.deleteMany({
        where: { projectId: project.id },
    });

    // Phase 1: Foundation & Setup (Level 0)
    const phase1 = await prisma.task.create({
        data: {
            projectId: project.id,
            title: 'Phase 1: Foundation & Setup',
            objective: 'Set up the project foundation with Next.js, database, and core infrastructure',
            status: 'DONE',
            hours: 40,
            branch: 'feature/foundation',
            order: 0,
            level: 0,
        },
    });

    const task1_1 = await prisma.task.create({
        data: {
            projectId: project.id,
            parentId: phase1.id,
            title: 'Next.js Project Setup',
            description: 'Initialize Next.js 15 with TypeScript and configure project structure',
            hours: 8,
            status: 'DONE',
            branch: 'feature/nextjs-setup',
            order: 0,
            level: 1,
        }
    });

    await prisma.task.createMany({
        data: [
            { projectId: project.id, parentId: task1_1.id, title: 'Install Next.js and dependencies', status: 'DONE', order: 0, level: 2, hours: 2 },
            { projectId: project.id, parentId: task1_1.id, title: 'Configure TypeScript', status: 'DONE', order: 1, level: 2, hours: 2 },
            { projectId: project.id, parentId: task1_1.id, title: 'Set up ESLint and Prettier', status: 'DONE', order: 2, level: 2, hours: 4 },
        ]
    });

    const task1_2 = await prisma.task.create({
        data: {
            projectId: project.id,
            parentId: phase1.id,
            title: 'Database Schema Design',
            description: 'Design and implement Prisma schema for all data models',
            hours: 12,
            status: 'DONE',
            branch: 'feature/database-schema',
            order: 1,
            level: 1,
        }
    });

    await prisma.task.createMany({
        data: [
            { projectId: project.id, parentId: task1_2.id, title: 'Define User and Auth models', status: 'DONE', order: 0, level: 2, hours: 4 },
            { projectId: project.id, parentId: task1_2.id, title: 'Define Project and Task models', status: 'DONE', order: 1, level: 2, hours: 4 },
            { projectId: project.id, parentId: task1_2.id, title: 'Create migrations', status: 'DONE', order: 2, level: 2, hours: 4 },
        ]
    });

    // Phase 2: Authentication & Subscription (Level 0)
    const phase2 = await prisma.task.create({
        data: {
            projectId: project.id,
            title: 'Phase 2: Authentication & Subscription',
            objective: 'Implement user authentication with GitHub OAuth and subscription management',
            status: 'IN PROGRESS',
            hours: 48,
            branch: 'feature/auth',
            order: 1,
            level: 0,
        },
    });

    const task2_1 = await prisma.task.create({
        data: {
            projectId: project.id,
            parentId: phase2.id,
            title: 'NextAuth.js Integration',
            description: 'Set up NextAuth.js with GitHub OAuth provider',
            hours: 24,
            status: 'DONE',
            branch: 'feature/nextauth',
            order: 0,
            level: 1,
        }
    });

    await prisma.task.createMany({
        data: [
            { projectId: project.id, parentId: task2_1.id, title: 'Configure NextAuth.js', status: 'DONE', order: 0, level: 2, hours: 8 },
            { projectId: project.id, parentId: task2_1.id, title: 'Set up GitHub OAuth', status: 'DONE', order: 1, level: 2, hours: 8 },
            { projectId: project.id, parentId: task2_1.id, title: 'Create session management', status: 'DONE', order: 2, level: 2, hours: 8 },
        ]
    });

    console.log('✅ Created root tasks (groups):');
    const rootTasks = await prisma.task.findMany({
        where: { projectId: project.id, level: 0 },
        include: { _count: { select: { children: true } } }
    });

    rootTasks.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title} (${t._count.children} tasks)`);
    });

    console.log('\n🎉 Sample tasks populated successfully!');
}

populateSampleTasks()
    .catch((e) => {
        console.error('❌ Failed to populate tasks:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
