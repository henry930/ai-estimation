import { streamText } from 'ai';
import { getAIModel, isAIConfigured } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    if (!isAIConfigured()) {
        return errorResponse('AI is not configured. Please add AWS credentials or OPENAI_API_KEY.', 500);
    }

    try {
        const { taskId, messages, groupId } = await req.json();

        if ((!taskId && !groupId) || !messages || !Array.isArray(messages)) {
            return errorResponse('Missing taskId/groupId or valid messages array', 400);
        }

        let systemPrompt = '';
        const id = taskId || groupId;

        if (taskId) {
            // 1. Fetch the target task for context
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    children: true,
                    documents: true
                }
            });

            if (!task) return errorResponse('Task not found', 404);

            systemPrompt = `You are an AI Project Assistant helping a developer with a specific task.
Task Title: ${task.title}
Task Description: ${task.description || 'No description provided.'}
Task Branch: ${task.branch || 'No branch assigned'}
Task Hours: ${task.hours || 0}h
Status: ${task.status}

Sub-tasks:
${task.children.map(s => `- [${s.status === 'DONE' ? 'x' : ' '}] ${s.title}`).join('\n') || 'No sub-tasks defined.'}

Documents:
${task.documents.map(d => `- ${d.title}: ${d.url}`).join('\n') || 'No documents attached.'}

Current AI Context/Prompt: ${task.aiPrompt || 'None'}

Your goal is to answer questions about this task, suggest refinements, or help with implementation details. 
Keep your answers technical, concise, and helpful.`;
        } else if (groupId) {
            // 2. Fetch the target group (level 0 task) for context
            const group = await prisma.task.findUnique({
                where: { id: groupId },
                include: {
                    children: true,
                    documents: true
                }
            });

            if (!group) return errorResponse('Phase not found', 404);

            systemPrompt = `You are an AI Project Assistant helping a developer with a project phase (Group).
Phase Title: ${group.title}
Phase Description: ${group.description || 'No description provided.'}
Phase Branch: ${group.branch || 'No branch assigned'}
Total Estimated Hours: ${group.hours || 0}h
Status: ${group.status}

Tasks in this Phase:
${group.children.map(t => `- [${t.status}] ${t.title} (${t.hours}h)`).join('\n') || 'No tasks defined for this phase.'}

Documents:
${group.documents.map(d => `- ${d.title}: ${d.url}`).join('\n') || 'No documents attached.'}

Your goal is to answer questions about this high-level phase, suggest coordination strategies, or help break down features into finer tasks. 
Keep your answers strategic, professional, and concise.`;
        }

        // 3. Call AI with streaming
        const result = await streamText({
            model: getAIModel(),
            system: systemPrompt,
            messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content
            })),
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return errorResponse(`Failed to process chat: ${error.message || 'Unknown error'}`, 500);
    }
}
