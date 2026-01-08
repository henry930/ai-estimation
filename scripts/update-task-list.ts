import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const projects = await prisma.project.findMany();
        const targetProject = projects.find(p => p.name.includes("AI Project") || p.name.includes("Estimation"));

        if (!targetProject) {
            console.log('Project not found');
            return;
        }

        const projectId = targetProject.id;
        console.log(`Updating tasks for project: ${targetProject.name} (${projectId})`);

        // 1. Find or Create Phase: "Feature Development"
        let phase = await prisma.task.findFirst({
            where: {
                projectId,
                level: 0,
                title: "Feature Development"
            }
        });

        if (!phase) {
            console.log('Creating "Feature Development" phase...');
            phase = await prisma.task.create({
                data: {
                    projectId,
                    title: "Feature Development",
                    level: 0,
                    status: 'PENDING',
                    order: 10
                }
            });
        }

        // 2. Add New Task: "GitHub Issues Integration"
        const taskTitle = "GitHub Issues Integration";
        const taskDescription = `Implement the new Issues workflow where issues are tasks with branches.
        
- Issues attached to tasks.
- Create new issues from UI.
- Issues have Branch, Status, Comment areas.
- Automated AI reporting on completion.
- Review Flow: Verified -> Merge to Main -> Close.`;

        let task = await prisma.task.findFirst({
            where: {
                projectId,
                parentId: phase.id,
                title: taskTitle
            }
        });

        if (task) {
            console.log(`Task "${taskTitle}" already exists. Updating...`);
            await prisma.task.update({
                where: { id: task.id },
                data: {
                    description: taskDescription,
                    status: 'PENDING' // Reset status to prompt attention
                }
            });
        } else {
            console.log(`Creating task "${taskTitle}"...`);
            task = await prisma.task.create({
                data: {
                    projectId,
                    parentId: phase.id,
                    title: taskTitle,
                    description: taskDescription,
                    level: 1,
                    status: 'PENDING',
                    hours: 8
                }
            });
        }

        // 3. Add Subtasks for the details
        const subtasks = [
            "UI: Create/View Issues within Task detail",
            "Backend: Link GitHub Issue to Task/Branch",
            "Workflow: Implement 'Verified' status logic",
            "Workflow: Auto-merge branch on Verification",
            "AI: Generate completion report on Issue close"
        ];

        console.log('Updating subtasks...');

        // Remove old subtasks to ensure clean slate (optional, but safer for "sync")
        // await prisma.task.deleteMany({ where: { parentId: task.id } });

        for (let i = 0; i < subtasks.length; i++) {
            const stTitle = subtasks[i];
            const existing = await prisma.task.findFirst({
                where: { parentId: task.id, title: stTitle }
            });

            if (!existing) {
                await prisma.task.create({
                    data: {
                        projectId,
                        parentId: task.id,
                        title: stTitle,
                        level: 2,
                        status: 'PENDING',
                        order: i
                    }
                });
            }
        }

        console.log('✅ Task List updated successfully.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
