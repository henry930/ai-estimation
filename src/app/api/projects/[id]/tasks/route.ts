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
        const rootTasks = await prisma.task.findMany({
            where: {
                projectId: id,
                parentId: null, // Get root tasks (level 0)
            },
            include: {
                children: {
                    include: {
                        children: true, // grandchildren (level 2)
                        documents: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                documents: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Map root tasks to "TaskGroups" for the existing frontend structure
        const formattedGroups = rootTasks.map(root => ({
            id: root.id,
            title: root.title,
            description: root.description,
            objective: root.objective,
            status: root.status,
            totalHours: root.hours,
            branch: root.branch,
            githubIssueNumber: root.githubIssueNumber,
            order: root.order,
            tasks: root.children.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                objective: task.objective,
                hours: task.hours,
                status: task.status,
                branch: task.branch,
                subtasks: task.children.map(sub => ({
                    id: sub.id,
                    title: sub.title,
                    isCompleted: sub.status === 'DONE',
                    hours: sub.hours,
                    githubIssueNumber: sub.githubIssueNumber,
                })),
                documents: task.documents,
            })),
            documents: root.documents,
        }));

        return NextResponse.json(formattedGroups);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description, status } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                projectId: id,
                title,
                description: description || null,
                status: status || 'PENDING',
                level: 0, // Create as root task
                hours: 0,
            }
        });

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
