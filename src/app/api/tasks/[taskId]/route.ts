
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
                group: {
                    select: {
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
                subtasks: {
                    orderBy: { order: 'asc' }
                },
                documents: true
            }
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
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

            // Handle subtasks if provided
            if (subtasks && Array.isArray(subtasks)) {
                await tx.subTask.deleteMany({ where: { taskId } });

                // Create subtasks in bulk if possible, otherwise map to skip loop overhead
                await Promise.all(subtasks.map((title, i) =>
                    tx.subTask.create({
                        data: { taskId, title, isCompleted: false, order: i }
                    })
                ));
            }

            // Handle documents if provided
            if (documents && Array.isArray(documents)) {
                await tx.taskDocument.deleteMany({ where: { taskId } });

                await Promise.all(documents.map(doc =>
                    tx.taskDocument.create({
                        data: {
                            taskId,
                            title: doc.title,
                            url: doc.url,
                            type: doc.type || 'link'
                        }
                    })
                ));
            }

            return task;
        });

        return NextResponse.json(updatedTask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
