import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel, isAIConfigured } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: Request) {
    if (!isAIConfigured()) {
        return errorResponse('AI is not configured. Please add AWS credentials or OPENAI_API_KEY.', 500);
    }

    try {
        const { taskId, tab, prompt } = await req.json();

        // 1. Fetch the target task
        const targetTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: { subtasks: true, documents: true }
        });

        if (!targetTask) return errorResponse('Task not found', 404);

        // 2. Fetch all other uncompleted tasks for global context
        const allUncompletedTasks = await prisma.task.findMany({
            where: {
                status: { not: 'DONE' },
                NOT: { id: taskId }
            },
            include: { subtasks: true }
        });

        // 3. Prepare schema for generation
        const schema = z.object({
            targetTaskUpdates: z.object({
                description: z.string().optional(),
                githubIssueNumber: z.number().optional(),
                hours: z.number().optional(),
                newSubtasks: z.array(z.string()).optional(),
                subtasksToToggle: z.array(z.object({
                    id: z.string(),
                    isCompleted: z.boolean()
                })).optional(),
                newDocuments: z.array(z.object({
                    title: z.string(),
                    url: z.string()
                })).optional()
            }),
            propagatedChanges: z.array(z.object({
                taskId: z.string(),
                updates: z.object({
                    description: z.string().optional(),
                    hours: z.number().optional(),
                    githubIssueNumber: z.number().optional()
                })
            })).optional()
        });

        // 4. Prepare the AI prompt
        const systemPrompt = `You are an AI Project Manager. Your goal is to refine a specific task while ensuring global consistency across all uncompleted tasks.
The user is refining the "${tab}" section of the task "${targetTask.title}".

Global Context (All Uncompleted Tasks):
${allUncompletedTasks.map(t => `- [${t.id}] ${t.title} (${t.status})`).join('\n')}

Refine the current task based on the user prompt. 
If the change affects other uncompleted tasks (e.g., changes dependencies, scope, or hours), you MUST include those changes too.`;

        const userContext = `Task: ${targetTask.title}
Current ${tab} content: ${tab === 'description' ? targetTask.description :
                tab === 'issues' ? `GitHub Issue #${targetTask.githubIssueNumber}` :
                    tab === 'todo' ? JSON.stringify(targetTask.subtasks) :
                        tab === 'documents' ? JSON.stringify(targetTask.documents) :
                            'No content'
            }

User Prompt: ${prompt}`;

        const { object: result } = await generateObject({
            model: getAIModel(),
            system: systemPrompt,
            prompt: userContext,
            schema,
        });

        // 5. Apply updates in a transaction
        await prisma.$transaction(async (tx) => {
            const { targetTaskUpdates, propagatedChanges } = result;

            if (targetTaskUpdates) {
                await tx.task.update({
                    where: { id: taskId },
                    data: {
                        description: targetTaskUpdates.description,
                        githubIssueNumber: targetTaskUpdates.githubIssueNumber,
                        hours: targetTaskUpdates.hours,
                    }
                });

                if (targetTaskUpdates.newSubtasks) {
                    for (const title of targetTaskUpdates.newSubtasks) {
                        await tx.subTask.create({
                            data: {
                                taskId: taskId,
                                title,
                                order: await tx.subTask.count({ where: { taskId } })
                            }
                        });
                    }
                }

                if (targetTaskUpdates.subtasksToToggle) {
                    for (const toggle of targetTaskUpdates.subtasksToToggle) {
                        await tx.subTask.update({
                            where: { id: toggle.id },
                            data: { isCompleted: toggle.isCompleted }
                        });
                    }
                }

                if (targetTaskUpdates.newDocuments) {
                    for (const doc of targetTaskUpdates.newDocuments) {
                        await tx.taskDocument.create({
                            data: {
                                taskId: taskId,
                                title: doc.title,
                                url: doc.url,
                                type: 'AI_REFINED'
                            }
                        });
                    }
                }
            }

            // Propagate changes
            if (propagatedChanges) {
                for (const change of propagatedChanges) {
                    await tx.task.update({
                        where: { id: change.taskId },
                        data: {
                            description: change.updates.description,
                            hours: change.updates.hours,
                            githubIssueNumber: change.updates.githubIssueNumber
                        }
                    });
                }
            }
        });

        return successResponse({ message: 'Refinement applied successfully', changes: result });
    } catch (error: any) {
        console.error('Refine Error:', error);
        return errorResponse(`Failed to refine task: ${error.message}`, 500);
    }
}
