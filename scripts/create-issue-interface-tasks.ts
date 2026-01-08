import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTasks() {
    console.log('Creating Phase 10 tasks...');

    const project = await prisma.project.findFirst({
        where: { name: { contains: 'Estimation' } } // Assuming standard project name
    });

    if (!project) {
        console.error('No suitable project found.');
        // Fallback or find any project? 
        // User probably works on a specific project. I'll pick the first one.
        const firstProject = await prisma.project.findFirst();
        if (firstProject) {
            console.log(`Using fallback project: ${firstProject.name}`);
            return createForProject(firstProject.id);
        }
        return;
    }

    await createForProject(project.id);
}

async function createForProject(projectId: string) {
    const phase10 = await prisma.task.create({
        data: {
            title: 'Phase 10: GitHub Issue Interface Frontend',
            description: 'Build a full-featured GitHub-like issue interface within the application.',
            projectId: projectId,
            status: 'PENDING',
            estimatedHours: 40,
            children: {
                create: [
                    {
                        title: '10.1 Issue List Component',
                        description: 'List tasks/issues with filtering, search, and sorting.',
                        status: 'PENDING',
                        estimatedHours: 8,
                        projectId: projectId
                    },
                    {
                        title: '10.2 Issue Detail View',
                        description: 'Detailed view of an issue with description and comment thread.',
                        status: 'PENDING',
                        estimatedHours: 12,
                        projectId: projectId
                    },
                    {
                        title: '10.3 Comment Editor',
                        description: 'Rich text/Markdown editor for adding comments.',
                        status: 'PENDING',
                        estimatedHours: 8,
                        projectId: projectId
                    },
                    {
                        title: '10.4 Sidebar & Metadata',
                        description: 'Manage labels, assignees, and status from the issue view.',
                        status: 'PENDING',
                        estimatedHours: 8,
                        projectId: projectId
                    }
                ]
            }
        }
    });

    console.log(`✅ Created Phase 10: ${phase10.title} (${phase10.id})`);
}

createTasks().catch(console.error).finally(() => prisma.$disconnect());
