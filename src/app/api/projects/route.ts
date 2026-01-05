import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        const { name, githubUrl, githubRepoId, description } = await req.json();

        if (!name || !githubRepoId) {
            return errorResponse('Missing required fields', 400);
        }

        // Check if project already exists for this user
        const existingProject = await prisma.project.findFirst({
            where: {
                userId: session.user.id,
                githubRepoId: String(githubRepoId),
            },
        });

        if (existingProject) {
            return errorResponse('Project already connected', 400);
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

        return successResponse(project);
    } catch (error: any) {
        return errorResponse(error.message, 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return errorResponse('Unauthorized', 401);
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { taskGroups: true }
                }
            }
        });

        return successResponse(projects);
    } catch (error: any) {
        console.error('API Error:', error);
        return errorResponse(error.message, 500);
    }
}
