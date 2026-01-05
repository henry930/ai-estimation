import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
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

        // Build context-aware system prompt
        let systemPrompt = 'You are an expert technical project manager and software architect. Help the user refine their task objectives, break down requirements, and suggest improvements. Be concise and practical.';

        // OPTIMIZATION: Fetch task data directly from database instead of using fetch()
        if (taskId) {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    subtasks: true,
                    documents: true,
                    issues: true
                }
            });

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
        }

        // Check if AWS credentials are configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return NextResponse.json({
                error: 'Configuration Error',
                details: 'AWS Credentials missing.'
            }, { status: 500 });
        }

        // Claude 3.5 Sonnet Inference Profile
        const modelId = 'eu.anthropic.claude-3-5-sonnet-20240620-v1:0';

        const result = await streamText({
            model: bedrock(modelId),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Bedrock API error:', error);
        return NextResponse.json({
            error: 'AI response failed',
            details: error.message
        }, { status: 500 });
    }
}
