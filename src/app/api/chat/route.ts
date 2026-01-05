import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { messages, taskId } = await req.json();

        // Build context-aware system prompt
        let systemPrompt = 'You are an expert technical project manager and software architect. Help the user refine their task objectives, break down requirements, and suggest improvements. Be concise and practical.';

        // If taskId is provided, fetch task context
        if (taskId) {
            try {
                // Use absolute URL for server-side fetch in Next.js
                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                const taskRes = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
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

        // Check if AWS credentials are configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return NextResponse.json({
                error: 'Configuration Error',
                details: 'AWS Credentials missing. Please check your .env file.'
            }, { status: 500 });
        }

        const modelId = 'eu.anthropic.claude-3-5-sonnet-20240620-v1:0';

        const result = await streamText({
            model: bedrock(modelId),
            system: systemPrompt,
            messages,
        });

        // result.toTextStreamResponse() returns a Response with the text stream
        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Bedrock API error:', error);
        return NextResponse.json({
            error: 'AI response failed',
            details: error.message
        }, { status: 500 });
    }
}
