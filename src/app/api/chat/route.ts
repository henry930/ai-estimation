import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { messages, taskId } = await req.json();

    // Build context-aware system prompt
    let systemPrompt = 'You are an expert technical project manager and software architect. Help the user refine their task objectives, break down requirements, and suggest improvements. Be concise and practical.';

    // If taskId is provided, fetch task context
    if (taskId) {
        try {
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

    // Check if AWS credentials are configured
    console.log('AWS Check:', {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        // Return mock response
        const mockMessage = "🤖 Mock AI Response\n\nI am a mock AI assistant. AWS credentials are not configured.\n\nTo enable real Claude Sonnet 4.5 responses, add these to your .env file:\n- AWS_ACCESS_KEY_ID\n- AWS_SECRET_ACCESS_KEY\n- AWS_REGION\n\nThen restart the dev server.\n\nFor now, I can still help you think through your task!";

        return new Response(mockMessage, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });
    }

    try {
        const result = await streamText({
            model: bedrock('anthropic.claude-3-5-sonnet-20241022-v2:0'),
            system: systemPrompt,
            messages,
        });

        // Return the text stream directly
        return new Response(result.textStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });
    } catch (error: any) {
        console.error('Bedrock error:', error);
        return NextResponse.json({
            error: 'Failed to get AI response',
            details: error.message
        }, { status: 500 });
    }
}
