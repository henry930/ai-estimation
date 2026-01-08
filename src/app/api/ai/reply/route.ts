import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { task, comments } = await req.json();
        const model = getAIModel();

        const prompt = `
You are an expert AI Project Manager assisting with a software project.
Task: ${task.title}
Description: ${task.description || task.objective || 'No description provided.'}
Status: ${task.status}

Discussion History:
${comments && comments.length > 0 ? comments.map((c: any) => `${c.author}: ${c.content}`).join('\n') : 'No comments yet.'}

Draft a concise, helpful, and professional response to the discussion.
If there are questions, answer them.
If the task is new, suggest an implementation approach or ask clarifying questions.
Do not include "Subject:" or headers. Just the comment content strings.
Start directly with the response.
`;

        const { text } = await generateText({
            model,
            prompt,
        });

        return NextResponse.json({ reply: text });
    } catch (e: any) {
        console.error('AI Reply Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
