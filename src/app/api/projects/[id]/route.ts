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
                estimations: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project);
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
        const { name, description, objective, status, aiInstructions } = body;

        const updatedProject = await prisma.project.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                name,
                description,
                objective,
                status,
                aiInstructions,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
