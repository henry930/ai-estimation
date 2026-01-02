import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, githubUrl, githubRepoId, description } = await req.json();

        if (!name || !githubRepoId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if project already exists for this user
        const existingProject = await prisma.project.findFirst({
            where: {
                userId: session.user.id,
                githubRepoId: String(githubRepoId),
            },
        });

        if (existingProject) {
            return NextResponse.json({ error: 'Project already connected' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                githubUrl,
                githubRepoId: String(githubRepoId),
                userId: session.user.id,
            },
        });

        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const projects = await prisma.project.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
