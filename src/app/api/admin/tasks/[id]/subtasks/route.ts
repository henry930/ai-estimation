import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { title } = body;

        const parentTask = await prisma.task.findUnique({
            where: { id },
            select: { projectId: true }
        });

        if (!parentTask) {
            return errorResponse('Parent task not found', 404);
        }

        const subtask = await prisma.task.create({
            data: {
                projectId: parentTask.projectId,
                parentId: id,
                title,
                level: 2,
                order: (await prisma.task.count({ where: { parentId: id } }))
            }
        });

        return successResponse(subtask);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to create subtask', 500);
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await params; // Await params even if not used
    try {
        const body = await req.json();
        const { subtaskId, isCompleted } = body;

        const subtask = await prisma.task.update({
            where: { id: subtaskId },
            data: {
                status: isCompleted ? 'DONE' : 'PENDING'
            }
        });

        return successResponse(subtask);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to update subtask', 500);
    }
}
