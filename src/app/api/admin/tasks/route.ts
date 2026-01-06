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

        const rootTasks = await prisma.task.findMany({
            where: {
                projectId: project.id,
                parentId: null
            },
            include: {
                children: {
                    include: {
                        children: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Map root tasks to "TaskGroups" for the existing admin interface
        const formattedGroups = rootTasks.map(root => ({
            id: root.id,
            projectId: root.projectId,
            title: root.title,
            description: root.description,
            objective: root.objective,
            status: root.status,
            order: root.order,
            tasks: root.children.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                order: task.order,
                subtasks: task.children.map(sub => ({
                    id: sub.id,
                    title: sub.title,
                    isCompleted: sub.status === 'DONE',
                    order: sub.order
                }))
            }))
        }));

        return successResponse(formattedGroups);
    } catch (error) {
        console.error('API Error:', error);
        return errorResponse('Failed to fetch tasks', 500);
    }
}
