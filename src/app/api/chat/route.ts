import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key',
});

export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages, taskId } = await req.json();

    // If no API key is present, return a mock streaming response
    if (!process.env.OPENAI_API_KEY) {
        const mockStream = new ReadableStream({
            start(controller) {
                const text = "I am a mock AI assistant. Please configure your OPENAI_API_KEY to get real responses.\n\nI can help you refine this task's objective, add subtasks, and suggest improvements.";
                const encoder = new TextEncoder();
                let i = 0;
                const interval = setInterval(() => {
                    if (i < text.length) {
                        controller.enqueue(encoder.encode(text[i]));
                        i++;
                    } else {
                        clearInterval(interval);
                        controller.close();
                    }
                }, 20);
            }
        });
        return new StreamingTextResponse(mockStream);
    }

    // Build context-aware system prompt
    let systemPrompt = 'You are an expert technical project manager and software architect. Help the user refine their task objectives, break down requirements, and suggest improvements. Be concise and practical.';

    // If taskId is provided, fetch task context
    if (taskId) {
        try {
            // Note: In edge runtime, we can't use Prisma directly
            // We'll need to fetch this from a separate API endpoint
            const taskRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tasks/${taskId}`, {
                headers: {
                    'Cookie': req.headers.get('cookie') || '',
                }
            });

            if (taskRes.ok) {
                const task = await taskRes.json();
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

When the user asks you to update the task, respond with a JSON object in this format:
\`\`\`json
{
  "action": "update_task",
  "updates": {
    "objective": "Updated objective text",
    "subtasks": ["Subtask 1", "Subtask 2"],
    "issues": ["Issue 1", "Issue 2"],
    "documents": [{"title": "Doc name", "url": "URL"}]
  }
}
\`\`\`

Be concise and actionable.`;
            }
        } catch (error) {
            console.error('Failed to fetch task context:', error);
        }
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}
