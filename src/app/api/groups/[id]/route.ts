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
        const group = await prisma.taskGroup.findUnique({
            where: {
                id,
                project: {
                    userId: session.user.id,
                },
            },
            include: {
                tasks: {
                    include: {
                        subtasks: true,
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

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json(group);
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

        const group = await prisma.taskGroup.update({
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

        return NextResponse.json(group);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
