import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const rootTask = await prisma.task.findUnique({
            where: {
                id,
                project: {
                    userId: session.user.id,
                },
            },
            include: {
                children: {
                    include: {
                        children: true, // grandchildren (subtasks)
                        documents: true,
                    },
                    orderBy: { order: 'asc' },
                },
                documents: true,
                project: {
                    select: {
                        name: true,
                        githubUrl: true,
                    }
                }
            },
        });

        if (!rootTask) {
            return NextResponse.json({ error: 'Group (Root Task) not found' }, { status: 404 });
        }

        // Map back to group format for compatibility
        const formattedGroup = {
            id: rootTask.id,
            projectId: rootTask.projectId,
            title: rootTask.title,
            description: rootTask.description,
            objective: rootTask.objective,
            status: rootTask.status,
            totalHours: rootTask.hours,
            branch: rootTask.branch,
            githubIssueNumber: rootTask.githubIssueNumber,
            project: rootTask.project,
            documents: rootTask.documents,
            tasks: rootTask.children.map(child => ({
                id: child.id,
                title: child.title,
                description: child.description,
                objective: child.objective,
                hours: child.hours,
                status: child.status,
                branch: child.branch,
                subtasks: child.children.map(grand => ({
                    id: grand.id,
                    title: grand.title,
                    isCompleted: grand.status === 'DONE',
                    hours: grand.hours,
                })),
                documents: child.documents
            }))
        };

        return NextResponse.json(formattedGroup);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, objective, status, githubIssueNumber } = body;

        const updatedTask = await prisma.task.update({
            where: {
                id,
                project: {
                    userId: session.user.id,
                },
            },
            data: {
                title,
                description,
                objective,
                status,
                githubIssueNumber: githubIssueNumber ? parseInt(githubIssueNumber) : undefined,
            },
        });

        return NextResponse.json(updatedTask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
