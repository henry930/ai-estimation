
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                parent: {
                    select: {
                        id: true,
                        title: true,
                        projectId: true,
                        project: {
                            select: {
                                name: true,
                                githubUrl: true
                            }
                        }
                    }
                },
                children: {
                    include: {
                        children: {
                            include: {
                                children: true
                            }
                        },
                        documents: true
                    },
                    orderBy: { order: 'asc' }
                },
                documents: true,
                project: true,
                comments: {
                    orderBy: { createdAt: 'desc' }
                },
            }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Format children as "breakdown" suitable for TaskBreakdownTable
        // If taskId is Level 0 (Phase), children are Level 1 (Tasks), children-children are Level 2 (Subtasks)
        // This mapping ensures that TaskBreakdownTable gets an array of "Categories" (even if just one)
        const breakdown = task.children.map(child => ({
            id: child.id,
            title: child.title,
            status: child.status,
            totalHours: child.hours,
            branch: child.branch,
            githubIssueNumber: child.githubIssueNumber,
            tasks: child.children.map(taskItem => ({
                id: taskItem.id,
                title: taskItem.title,
                status: taskItem.status,
                hours: taskItem.hours || 0,
                completed: taskItem.status === 'DONE',
                branch: taskItem.branch,
                subtasks: taskItem.children.map(subTaskItem => ({
                    id: subTaskItem.id,
                    title: subTaskItem.title,
                    isCompleted: subTaskItem.status === 'DONE',
                    hours: subTaskItem.hours,
                    githubIssueNumber: subTaskItem.githubIssueNumber,
                }))
            }))
        }));

        return NextResponse.json({
            ...task,
            projectId: task.projectId,
            breakdown,
            // standard UnifiedNode fields
            title: task.title,
            description: task.description,
            objective: task.objective,
            status: task.status,
            hours: task.hours || 0,
            project: {
                name: task.project.name,
                githubUrl: task.project.githubUrl
            },
            documents: task.documents,
            githubIssueNumber: task.githubIssueNumber,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, objective, description, status, subtasks, githubIssueNumber, documents } = body;

        // Update main task fields
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (objective !== undefined) updateData.objective = objective;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (githubIssueNumber !== undefined) updateData.githubIssueNumber = githubIssueNumber;

        // Use a transaction for atomic and faster updates
        const updatedTask = await prisma.$transaction(async (tx) => {
            const task = await tx.task.update({
                where: { id: taskId },
                data: updateData
            });

            // Handle subtasks if provided (now as children)
            if (subtasks && Array.isArray(subtasks)) {
                await tx.task.deleteMany({
                    where: {
                        parentId: taskId,
                        level: 2 // Only delete "subtask" level children
                    }
                });

                // Create subtasks as children
                for (const [i, stTitle] of subtasks.entries()) {
                    await tx.task.create({
                        data: {
                            projectId: task.projectId,
                            parentId: taskId,
                            title: stTitle,
                            status: 'PENDING',
                            order: i,
                            level: 2
                        }
                    });
                }
            }

            // Handle documents if provided
            if (documents && Array.isArray(documents)) {
                await tx.taskDocument.deleteMany({ where: { taskId } });

                for (const doc of documents) {
                    await tx.taskDocument.create({
                        data: {
                            taskId,
                            title: doc.title,
                            url: doc.url,
                            type: doc.type || 'link'
                        }
                    });
                }
            }

            return task;
        });

        return NextResponse.json(updatedTask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
