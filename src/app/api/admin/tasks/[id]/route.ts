import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                group: true,
                subtasks: {
                    orderBy: { order: 'asc' }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!task) {
            return errorResponse('Task not found', 404);
        }

        return successResponse(task);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to fetch task details', 500);
    }
}
