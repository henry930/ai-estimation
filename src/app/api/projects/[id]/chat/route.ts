import { streamText } from 'ai';
import { getAIModel, isAIConfigured } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    if (!isAIConfigured()) {
        return errorResponse('AI is not configured. Please add AWS credentials or OPENAI_API_KEY.', 500);
    }

    try {
        const { id: projectId } = await context.params;
        const { messages } = await req.json();

        if (!projectId || !messages || !Array.isArray(messages)) {
            return errorResponse('Missing projectId or valid messages array', 400);
        }

        // 1. Fetch the whole project context
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    include: {
                        documents: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!project) return errorResponse('Project not found', 404);

        // Organize tasks into phases (level 0) and tasks (level 1)
        const phases = project.tasks.filter(t => t.level === 0);
        const tasks = project.tasks.filter(t => t.level === 1);
        const subtasks = project.tasks.filter(t => t.level === 2);

        // 2. Build system prompt with project context
        const projectSummary = `Project ID: ${project.id}
Project Name: ${project.name}
Description: ${project.description || 'N/A'}
Objective: ${project.objective || 'N/A'}

Task List Structure:
${phases.map(group => `
Phase: ${group.title} (ID: ${group.id}, Status: ${group.status}, Hours: ${group.hours}h)
${tasks.filter(t => t.parentId === group.id).map(task => `  - Task: ${task.title} (ID: ${task.id}, ${task.hours}h, Status: ${task.status})
    Description: ${task.description || 'N/A'}
    Sub-tasks: ${subtasks.filter(s => s.parentId === task.id).map(s => `[${s.status === 'DONE' ? 'x' : ' '}] ${s.title}`).join(', ') || 'None'}`).join('\n')}`).join('\n')}
`;

        const systemPrompt = `You are the AI Project Agent, a strategic architect responsible for the overall success of the project: "${project.name}".

Your role:
1. Analyze the user's comments, instructions, or requests.
2. If the user wants to change the project structure (phases, tasks, descriptions, or hours), you MUST:
   - Provide a natural language explanation of what you suggest.
   - Include a structured proposal wrapped in <PROJECT_UPDATE_PROPOSAL> JSON tags.
   - ASK for explicit permission to apply these updates.

PROPOSAL FORMAT:
If you want to suggest changes, include this in your response:
<PROJECT_UPDATE_PROPOSAL>
{
  "projectObjective": "new objective if changed",
  "projectDescription": "new description if changed",
  "groups": [
    {
      "id": "existing_id_if_known",
      "title": "New or Existing Phase Title",
      "objective": "High level goal for this phase",
      "status": "DONE | IN PROGRESS | PENDING",
      "totalHours": 40,
      "tasks": [
        {
          "id": "existing_id_if_known",
          "title": "Task Title",
          "description": "Task description",
          "hours": 8,
          "status": "PENDING"
        }
      ]
    }
  ]
}
</PROJECT_UPDATE_PROPOSAL>

3. You can "refine" the whole project by suggesting new task groups, deleting obsolete phases, or re-estimating hours.
4. Keep your tone professional, strategic, and concise.

Current Project Status:
${projectSummary}

Always end a suggestion with a question asking for authorization to proceed.`;

        // 3. Call AI with streaming
        const model = getAIModel();
        const result = await streamText({
            model,
            system: systemPrompt,
            messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content
            })),
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Project Agent API Error:', error);
        return errorResponse(`Failed to process agent request: ${error.message || 'Unknown error'}`, 500);
    }
}
