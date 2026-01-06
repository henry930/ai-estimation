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
        const taskGroups = await prisma.taskGroup.findMany({
            where: {
                projectId: id,
            },
            include: {
                tasks: {
                    include: {
                        subtasks: true,
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

        return NextResponse.json(taskGroups);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
