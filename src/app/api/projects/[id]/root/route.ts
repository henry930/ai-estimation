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
        const project = await prisma.project.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                tasks: {
                    where: { parentId: null }, // Only root tasks (phases/groups)
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Calculate total hours from root tasks if project.totalHours is not explicit
        const totalHours = project.tasks.reduce((sum, t) => sum + (t.hours || 0), 0);

        // Normalize to UniversalNode structure
        const rootNode = {
            id: project.id,
            projectId: project.id,
            title: project.name,
            description: project.description,
            objective: project.objective,
            status: project.status,
            totalHours: totalHours,
            hours: totalHours,
            project: {
                name: project.name,
                githubUrl: project.githubUrl,
            },
            children: project.tasks,
            documents: [], // Project documents could be added here later
            level: -1,
            parentId: null
        };

        return NextResponse.json(rootNode);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
