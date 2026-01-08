// @ts-nocheck
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/ai-provider';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, taskId } = await req.json();

        // Fetch task context if available
        let task = null;
        if (taskId) {
            task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    children: true,
                    documents: true
                }
            });
        }

        // Build context-aware system prompt
        let systemPrompt = 'You are an expert technical project manager and software architect. Help the user refine their task objectives, break down requirements, and suggest improvements. Be concise and practical. Use the available tools to update the task details when requested.';

        if (task) {
            systemPrompt = `You are an expert technical project manager helping refine this task:

**Task Title**: ${task.title}
**Current Objective**: ${task.objective || task.description || 'Not defined'}
**Status**: ${task.status}
**Estimated Hours**: ${task.hours || 'Not estimated'}

${task.aiPrompt ? `**Special Instructions**: ${task.aiPrompt}` : ''}

Your role:
1. Help the user refine and clarify the task objective
2. Suggest subtasks or implementation steps
3. Identify potential issues or blockers
4. Recommend relevant documentation or resources

Use the \`updatePlan\` tool to save any important changes to the system plan, issues, documents, or subtasks.`;
        }

        const result = await streamText({
            model: getAIModel(),
            system: systemPrompt,
            messages: messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content || ''
            })),
            tools: {
                updatePlan: tool({
                    description: 'Update the implementation plan, issues, documents, and subtasks for the current task.',
                    parameters: z.object({
                        objective: z.string().optional().describe('The detailed implementation plan or objective of the task.'),
                        issues: z.array(z.string()).optional().describe('List of potential issues or blockers identified.'),
                        documents: z.array(z.object({
                            title: z.string(),
                            url: z.string()
                        })).optional().describe('List of relevant documentation links.'),
                        newSubtasks: z.array(z.string()).optional().describe('List of new subtasks or steps to be added to the task.')
                    }),
                    execute: async ({ objective, issues, documents, newSubtasks }) => {
                        if (!task || !taskId) return 'No task found to update.';

                        const updates: string[] = [];

                        // 1. Update objective and append issues if any
                        let finalObjective = objective;
                        if (issues && issues.length > 0) {
                            const issuesText = "\n\n### Identified Issues\n" + issues.map(i => `- ${i}`).join('\n');
                            finalObjective = (finalObjective || (task.objective || task.description || "")) + issuesText;
                        }

                        if (finalObjective !== undefined && finalObjective !== task.objective) {
                            await prisma.task.update({
                                where: { id: taskId },
                                data: { objective: finalObjective }
                            });
                            updates.push('Updated objective/plan.');
                        }

                        // 2. Add documents
                        if (documents && documents.length > 0) {
                            await prisma.taskDocument.createMany({
                                data: documents.map(doc => ({
                                    taskId,
                                    title: doc.title,
                                    url: doc.url,
                                    type: 'link'
                                }))
                            });
                            updates.push(`Added ${documents.length} documents.`);
                        }

                        // 3. Add subtasks
                        if (newSubtasks && newSubtasks.length > 0) {
                            const count = await prisma.task.count({ where: { parentId: taskId } });

                            await Promise.all(newSubtasks.map((title, idx) =>
                                prisma.task.create({
                                    data: {
                                        projectId: task.projectId,
                                        parentId: taskId,
                                        title,
                                        status: 'PENDING',
                                        order: count + idx
                                    }
                                })
                            ));
                            updates.push(`Added ${newSubtasks.length} new subtasks.`);
                        }

                        return updates.length > 0 ? updates.join(' ') : 'No changes made.';
                    },
                }),
            },
            maxSteps: 5,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('AI error:', error);
        return NextResponse.json({
            error: 'AI response failed',
            details: error.message
        }, { status: 500 });
    }
}
