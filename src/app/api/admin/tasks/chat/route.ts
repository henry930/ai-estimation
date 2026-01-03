import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai, isAIConfigured } from '@/lib/openai';
import { streamToResponse } from '@/lib/ai-stream';
import { errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    if (!isAIConfigured()) {
        return errorResponse('AI is not configured. Please add OPENAI_API_KEY.', 500);
    }

    try {
        const { taskId, messages } = await req.json();

        if (!taskId || !messages || !Array.isArray(messages)) {
            return errorResponse('Missing taskId or valid messages array', 400);
        }

        // 1. Fetch the target task for context
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { subtasks: true, documents: true }
        });

        if (!task) return errorResponse('Task not found', 404);

        // 2. Build system prompt with task context
        const systemPrompt = `You are an AI Project Assistant helping a developer with a specific task.
Task Title: ${task.title}
Task Description: ${task.description || 'No description provided.'}
Task Branch: ${task.branch || 'No branch assigned'}
Task Hours: ${task.hours || 0}h
Status: ${task.status}

Sub-tasks:
${task.subtasks.map(s => `- [${s.isCompleted ? 'x' : ' '}] ${s.title}`).join('\n') || 'No sub-tasks defined.'}

Documents:
${task.documents.map(d => `- ${d.title}: ${d.url}`).join('\n') || 'No documents attached.'}

Current AI Context/Prompt: ${task.aiPrompt || 'None'}

Your goal is to answer questions about this task, suggest refinements, or help with implementation details. 
Keep your answers technical, concise, and helpful. If asked to refine the task (e.g., adding subtasks or changing description), 
advise the user to use the "Refine" action in the UI for automated updates, but you can suggest the specific changes here first.`;

        // 3. Call OpenAI with streaming
        console.log('Calling OpenAI with messages:', messages.length);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                }))
            ],
            stream: true,
        });

        console.log('OpenAI response received, starting stream...');
        return streamToResponse(response);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return errorResponse(`Failed to process chat: ${error.message || 'Unknown error'}`, 500);
    }
}
