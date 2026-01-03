import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { status, branch, description, aiPrompt, issues } = body;

        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
                status: status || undefined,
                branch: branch || undefined,
                description: description || undefined,
                aiPrompt: aiPrompt || undefined,
                issues: issues || undefined,
            }
        });

        // Special logic: If status becomes IN PROGRESS and no branch is set, 
        // we might want to suggest one or auto-generate. 
        // Real branch creation would happen via git commands on the server if possible, 
        // but here it's more for tracking.

        return successResponse(updatedTask);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to update task', 500);
    }
}
