import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateSampleTasks() {
    console.log('🌱 Populating sample task groups and tasks...\n');

    // Get the first project
    const project = await prisma.project.findFirst();

    if (!project) {
        console.error('❌ No project found. Please create a project first.');
        process.exit(1);
    }

    console.log(`📦 Adding tasks to project: ${project.name}\n`);

    // Clear existing task groups for this project
    await prisma.taskGroup.deleteMany({
        where: { projectId: project.id },
    });

    // Phase 1: Foundation & Setup
    const phase1 = await prisma.taskGroup.create({
        data: {
            projectId: project.id,
            title: 'Phase 1: Foundation & Setup',
            objective: 'Set up the project foundation with Next.js, database, and core infrastructure',
            status: 'DONE',
            totalHours: 40,
            branch: 'feature/foundation',
            order: 0,
            tasks: {
                create: [
                    {
                        title: 'Next.js Project Setup',
                        description: 'Initialize Next.js 15 with TypeScript and configure project structure',
                        hours: 8,
                        status: 'DONE',
                        branch: 'feature/nextjs-setup',
                        order: 0,
                        subtasks: {
                            create: [
                                { title: 'Install Next.js and dependencies', isCompleted: true, order: 0 },
                                { title: 'Configure TypeScript', isCompleted: true, order: 1 },
                                { title: 'Set up ESLint and Prettier', isCompleted: true, order: 2 },
                            ],
                        },
                    },
                    {
                        title: 'Database Schema Design',
                        description: 'Design and implement Prisma schema for all data models',
                        hours: 12,
                        status: 'DONE',
                        branch: 'feature/database-schema',
                        order: 1,
                        subtasks: {
                            create: [
                                { title: 'Define User and Auth models', isCompleted: true, order: 0 },
                                { title: 'Define Project and Task models', isCompleted: true, order: 1 },
                                { title: 'Create migrations', isCompleted: true, order: 2 },
                            ],
                        },
                    },
                    {
                        title: 'UI Component Library',
                        description: 'Set up Tailwind CSS and create reusable UI components',
                        hours: 16,
                        status: 'DONE',
                        branch: 'feature/ui-components',
                        order: 2,
                    },
                ],
            },
        },
    });

    // Phase 2: Authentication & Subscription
    const phase2 = await prisma.taskGroup.create({
        data: {
            projectId: project.id,
            title: 'Phase 2: Authentication & Subscription',
            objective: 'Implement user authentication with GitHub OAuth and subscription management',
            status: 'IN PROGRESS',
            totalHours: 48,
            branch: 'feature/auth',
            order: 1,
            tasks: {
                create: [
                    {
                        title: 'NextAuth.js Integration',
                        description: 'Set up NextAuth.js with GitHub OAuth provider',
                        hours: 24,
                        status: 'DONE',
                        branch: 'feature/nextauth',
                        order: 0,
                        subtasks: {
                            create: [
                                { title: 'Configure NextAuth.js', isCompleted: true, order: 0 },
                                { title: 'Set up GitHub OAuth', isCompleted: true, order: 1 },
                                { title: 'Create session management', isCompleted: true, order: 2 },
                            ],
                        },
                    },
                    {
                        title: 'Subscription Management',
                        description: 'Implement subscription tiers and Stripe integration',
                        hours: 24,
                        status: 'IN PROGRESS',
                        branch: 'feature/subscriptions',
                        order: 1,
                        subtasks: {
                            create: [
                                { title: 'Define subscription tiers', isCompleted: true, order: 0 },
                                { title: 'Integrate Stripe API', isCompleted: false, order: 1 },
                                { title: 'Create subscription UI', isCompleted: false, order: 2 },
                            ],
                        },
                    },
                ],
            },
        },
    });

    // Phase 3: Frontend Development
    const phase3 = await prisma.taskGroup.create({
        data: {
            projectId: project.id,
            title: 'Phase 3: Frontend Development',
            objective: 'Build the main dashboard and project management interface',
            status: 'IN PROGRESS',
            totalHours: 80,
            branch: 'feature/frontend',
            order: 2,
            tasks: {
                create: [
                    {
                        title: 'Dashboard Layout',
                        description: 'Create the main dashboard with project overview',
                        hours: 20,
                        status: 'DONE',
                        branch: 'feature/dashboard',
                        order: 0,
                    },
                    {
                        title: 'Project Details Page',
                        description: 'Build project details page with task breakdown',
                        hours: 24,
                        status: 'IN PROGRESS',
                        branch: 'feature/project-details',
                        order: 1,
                        subtasks: {
                            create: [
                                { title: 'Create project header', isCompleted: true, order: 0 },
                                { title: 'Implement task list view', isCompleted: true, order: 1 },
                                { title: 'Add task filtering', isCompleted: false, order: 2 },
                            ],
                        },
                    },
                    {
                        title: 'Task Management UI',
                        description: 'Build task creation, editing, and status management',
                        hours: 28,
                        status: 'PENDING',
                        branch: 'feature/task-management',
                        order: 2,
                    },
                ],
            },
        },
    });

    // Phase 4: Backend API & AI Integration
    const phase4 = await prisma.taskGroup.create({
        data: {
            projectId: project.id,
            title: 'Phase 4: Backend API & AI Integration',
            objective: 'Develop REST APIs and integrate OpenAI for project estimation',
            status: 'PENDING',
            totalHours: 64,
            branch: 'feature/backend',
            order: 3,
            tasks: {
                create: [
                    {
                        title: 'Project API Endpoints',
                        description: 'Create CRUD endpoints for projects',
                        hours: 16,
                        status: 'DONE',
                        branch: 'feature/project-api',
                        order: 0,
                    },
                    {
                        title: 'Task API Endpoints',
                        description: 'Create CRUD endpoints for tasks and task groups',
                        hours: 20,
                        status: 'IN PROGRESS',
                        branch: 'feature/task-api',
                        order: 1,
                    },
                    {
                        title: 'AI Estimation Engine',
                        description: 'Integrate OpenAI for automated project estimation',
                        hours: 28,
                        status: 'PENDING',
                        branch: 'feature/ai-estimation',
                        order: 2,
                        subtasks: {
                            create: [
                                { title: 'Set up OpenAI API client', isCompleted: false, order: 0 },
                                { title: 'Create estimation prompts', isCompleted: false, order: 1 },
                                { title: 'Build estimation UI', isCompleted: false, order: 2 },
                            ],
                        },
                    },
                ],
            },
        },
    });

    // Phase 5: GitHub Integration
    const phase5 = await prisma.taskGroup.create({
        data: {
            projectId: project.id,
            title: 'Phase 5: GitHub Integration',
            objective: 'Sync tasks with GitHub Issues and repositories',
            status: 'PENDING',
            totalHours: 56,
            branch: 'feature/github',
            order: 4,
            tasks: {
                create: [
                    {
                        title: 'GitHub API Integration',
                        description: 'Set up GitHub API client and authentication',
                        hours: 16,
                        status: 'PENDING',
                        branch: 'feature/github-api',
                        order: 0,
                    },
                    {
                        title: 'Repository Sync',
                        description: 'Sync project data with GitHub repositories',
                        hours: 24,
                        status: 'PENDING',
                        branch: 'feature/repo-sync',
                        order: 1,
                    },
                    {
                        title: 'Issue Management',
                        description: 'Create and manage GitHub Issues from tasks',
                        hours: 16,
                        status: 'PENDING',
                        branch: 'feature/issue-management',
                        order: 2,
                    },
                ],
            },
        },
    });

    // Get task counts
    const taskCounts = await Promise.all([
        prisma.task.count({ where: { groupId: phase1.id } }),
        prisma.task.count({ where: { groupId: phase2.id } }),
        prisma.task.count({ where: { groupId: phase3.id } }),
        prisma.task.count({ where: { groupId: phase4.id } }),
        prisma.task.count({ where: { groupId: phase5.id } }),
    ]);

    console.log('✅ Created task groups:');
    console.log(`   1. ${phase1.title} (${taskCounts[0]} tasks)`);
    console.log(`   2. ${phase2.title} (${taskCounts[1]} tasks)`);
    console.log(`   3. ${phase3.title} (${taskCounts[2]} tasks)`);
    console.log(`   4. ${phase4.title} (${taskCounts[3]} tasks)`);
    console.log(`   5. ${phase5.title} (${taskCounts[4]} tasks)`);
    console.log('\n🎉 Sample tasks populated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log in to the application at http://localhost:3001');
    console.log('   2. Navigate to the project details page');
    console.log('   3. You should now see the task breakdown!');
}

populateSampleTasks()
    .catch((e) => {
        console.error('❌ Failed to populate tasks:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
