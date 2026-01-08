import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // Get all potential parents (Phases/main tasks - levels 0 and 1)
        const potentialParents = await prisma.task.findMany({
            where: {
                projectId: task.projectId,
                id: { not: taskId },
                level: { lt: 2 }
            },
            select: { id: true, title: true, level: true }
        });

        if (potentialParents.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No potential parent tasks found in this project."
            });
        }

        const model = getAIModel();
        const prompt = `
You are an expert technical project manager. 
We have an technical issue: "${task.title}"
Description: ${task.description || task.objective || 'No description provided.'}

Here is the current project structure (ID and Title):
${potentialParents.map(p => `- ${p.id}: ${p.title} (Level ${p.level})`).join('\n')}

Based on the title and description, which parent task or phase is the BEST fit for this item to be placed under as a sub-item?
Reply ONLY with the ID of the suggested parent task. 
If none fit well, reply with the ID of the first phase or "NONE".
Do not include any other text.
`;

        const { text } = await generateText({
            model,
            prompt,
        });

        const suggestedId = text.trim();
        const parent = potentialParents.find(p => p.id === suggestedId);

        if (parent) {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    parentId: parent.id,
                    level: parent.level + 1
                }
            });

            return NextResponse.json({
                success: true,
                suggestedParent: parent.title,
                parentId: parent.id,
                message: `Placed under "${parent.title}"`
            });
        }

        return NextResponse.json({
            success: false,
            message: "AI could not find a suitable location in the task tree."
        });

    } catch (e: any) {
        console.error('Auto-locate error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
