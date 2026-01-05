import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    try {
        // For now, we assume there is one primary project for management
        // In a shared environment, we would check for admin roles and project IDs
        const project = await prisma.project.findFirst({
            where: { name: 'AI Estimation System' }
        });

        if (!project) {
            return errorResponse('Management project not found', 404);
        }

        const taskGroups = await prisma.taskGroup.findMany({
            where: { projectId: project.id },
            include: {
                tasks: {
                    include: {
                        subtasks: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        return successResponse(taskGroups);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to fetch tasks', 500);
    }
}
