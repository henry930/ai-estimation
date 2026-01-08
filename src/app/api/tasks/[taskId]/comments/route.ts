import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await prisma.taskComment.create({
            data: {
                taskId,
                content,
                author: session.user.name || session.user.email || 'Unknown',
            }
        });

        // Trigger task update for sorting/recency
        await prisma.task.update({
            where: { id: taskId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
