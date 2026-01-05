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

        const subtask = await prisma.subTask.create({
            data: {
                taskId: id,
                title,
                order: (await prisma.subTask.count({ where: { taskId: id } }))
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
    // This endpoint handles individual subtask updates (toggling complete)
    // Actually, it might be better to have /api/admin/subtasks/[subid]
    // But for simplicity, we can pass subtaskId in the body
    try {
        const body = await req.json();
        const { subtaskId, isCompleted } = body;

        const subtask = await prisma.subTask.update({
            where: { id: subtaskId },
            data: { isCompleted }
        });

        return successResponse(subtask);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to update subtask', 500);
    }
}
