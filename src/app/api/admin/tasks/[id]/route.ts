import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const rootTask = await prisma.task.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    orderBy: { order: 'asc' }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!rootTask) {
            return errorResponse('Task not found', 404);
        }

        // Map back to expected structure
        const formattedTask = {
            ...rootTask,
            group: rootTask.parent,
            subtasks: rootTask.children.map(child => ({
                ...child,
                isCompleted: child.status === 'DONE'
            }))
        };

        return successResponse(formattedTask);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to fetch task details', 500);
    }
}
