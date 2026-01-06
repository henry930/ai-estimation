import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: projectId } = await context.params;

    try {
        const { proposal } = await req.json();

        if (!projectId || !proposal) {
            return errorResponse('Missing projectId or proposal', 400);
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) return errorResponse('Project not found', 404);

        // Apply updates in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update project level fields if present
            if (proposal.projectObjective || proposal.projectDescription) {
                await tx.project.update({
                    where: { id: projectId },
                    data: {
                        objective: proposal.projectObjective || undefined,
                        description: proposal.projectDescription || undefined
                    }
                });
            }

            // 2. Handle groups and tasks
            if (proposal.groups && Array.isArray(proposal.groups)) {
                // To keep it simple and safe for this agentic interaction:
                // We'll update existing ones and create new ones.
                // Note: Deletion is trickier, we might want to handle it too but for now let's focus on updates/additions.

                for (let i = 0; i < proposal.groups.length; i++) {
                    const groupData = proposal.groups[i];
                    let group;

                    if (groupData.id && groupData.id.startsWith('cm')) { // Prisma CUID check
                        group = await tx.task.update({
                            where: { id: groupData.id },
                            data: {
                                title: groupData.title,
                                objective: groupData.objective,
                                status: groupData.status,
                                hours: groupData.totalHours,
                                order: i,
                                level: 0
                            }
                        });
                    } else {
                        group = await tx.task.create({
                            data: {
                                projectId,
                                title: groupData.title,
                                objective: groupData.objective,
                                status: groupData.status || 'PENDING',
                                hours: groupData.totalHours || 0,
                                order: i,
                                level: 0
                            }
                        });
                    }

                    // Handle tasks within group
                    if (groupData.tasks && Array.isArray(groupData.tasks)) {
                        for (let j = 0; j < groupData.tasks.length; j++) {
                            const taskData = groupData.tasks[j];
                            if (taskData.id && taskData.id.startsWith('cm')) {
                                await tx.task.update({
                                    where: { id: taskData.id },
                                    data: {
                                        title: taskData.title,
                                        description: taskData.description,
                                        objective: taskData.objective || taskData.description,
                                        hours: taskData.hours,
                                        status: taskData.status || 'PENDING',
                                        order: j,
                                        parentId: group.id,
                                        level: 1
                                    }
                                });
                            } else {
                                await tx.task.create({
                                    data: {
                                        projectId,
                                        parentId: group.id,
                                        title: taskData.title,
                                        description: taskData.description,
                                        objective: taskData.objective || taskData.description,
                                        hours: taskData.hours || 0,
                                        status: taskData.status || 'PENDING',
                                        order: j,
                                        level: 1
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });

        return successResponse({ message: 'Project plan updated successfully' });
    } catch (error: any) {
        console.error('Apply Proposal Error:', error);
        return errorResponse(`Failed to apply proposal: ${error.message}`, 500);
    }
}
