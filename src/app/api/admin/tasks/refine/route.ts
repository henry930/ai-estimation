import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai, isAIConfigured } from '@/lib/openai';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    if (!isAIConfigured()) {
        return errorResponse('AI is not configured. Please add OPENAI_API_KEY.', 500);
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

        // 3. Prepare the AI prompt
        const systemPrompt = `You are an AI Project Manager. Your goal is to refine a specific task while ensuring global consistency across all uncompleted tasks.
The user is refining the "${tab}" section of the task "${targetTask.title}".

Global Context (All Uncompleted Tasks):
${allUncompletedTasks.map(t => `- [${t.id}] ${t.title} (${t.status})`).join('\n')}

Refine the current task based on the user prompt. 
If the change affects other uncompleted tasks (e.g., changes dependencies, scope, or hours), you MUST include those changes too.

RESPONSE FORMAT (JSON):
{
  "targetTaskUpdates": {
    "description": "updated text (optional)",
    "issues": "updated issues list (optional)",
    "hours": number (optional),
    "newSubtasks": ["title of new subtask to add"],
    "subtasksToToggle": [{"id": "string", "isCompleted": boolean}],
    "newDocuments": [{"title": "string", "url": "string"}]
  },
  "propagatedChanges": [
    {
      "taskId": "string",
      "updates": {
        "description": "updated text",
        "hours": number,
        "issues": "updated issues"
      }
    }
  ]
}`;

        const userContext = `Task: ${targetTask.title}
Current ${tab} content: ${tab === 'description' ? targetTask.description :
                tab === 'issues' ? targetTask.issues :
                    tab === 'todo' ? JSON.stringify(targetTask.subtasks) :
                        tab === 'documents' ? JSON.stringify(targetTask.documents) :
                            'No content'
            }

User Prompt: ${prompt}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContext }
            ],
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        // 4. Apply updates in a transaction
        await prisma.$transaction(async (tx) => {
            // Update target task
            const { targetTaskUpdates, propagatedChanges } = result;

            if (targetTaskUpdates) {
                await tx.task.update({
                    where: { id: taskId },
                    data: {
                        description: targetTaskUpdates.description,
                        issues: targetTaskUpdates.issues,
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
                        console.log('Creating document:', doc);
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
                            issues: change.updates.issues
                        }
                    });
                }
            }
        });

        return successResponse({ message: 'Refinement applied successfully', changes: result });
    } catch (error) {
        console.error('Refine Error:', error);
        return errorResponse('Failed to refine task', 500);
    }
}
