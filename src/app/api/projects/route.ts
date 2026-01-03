import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // For development/demo, we might want to return all projects if not authenticated,
        // but typically we'd filter by user. Let's try to get user from session.
        const userId = session?.user?.id;

        const projects = await prisma.project.findMany({
            where: userId ? { userId } : {}, // Filter by user if logged in
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { taskGroups: true }
                }
            }
        });

        return successResponse(projects);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to fetch projects', 500);
    }
}
