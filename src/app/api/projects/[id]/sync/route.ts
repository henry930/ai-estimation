import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Simulate Sync logic (e.g. checking GitHub repo status)
        // In a real app, you would call octokit.repos.get(...)

        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: {
                status: 'active',
                lastSync: new Date(),
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
