// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

/**
 * AI Assistant for specific tasks or groups
 */
export async function POST(req: Request) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        return errorResponse('AI is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY.', 500);
    }

    try {
        const { messages, taskId, groupId } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return errorResponse('Valid messages array is required', 400);
        }

        const id = taskId || groupId;
        if (!id) {
            return errorResponse('taskId or groupId is required', 400);
        }

        // Fetch context for the prompt
        const task = await prisma.task.findUnique({
            where: { id: id },
            include: {
                documents: true,
                children: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!task) return errorResponse('Task not found', 404);

        const project = await prisma.project.findUnique({
            where: { id: task.projectId }
        });

        const subtasksSummary = task.children.length > 0
            ? task.children.map(c => `- [${c.status}] ${c.title} (${c.hours || 0}h)`).join('\n')
            : 'No subtasks yet.';

        const docsSummary = task.documents.length > 0
            ? task.documents.map(d => `- ${d.title}: ${d.url}`).join('\n')
            : 'No documents linked.';

        const systemPrompt = `You are a Technical Lead assisting with the task: "${task.title}" 
within project: "${project?.name}".

**Context**:
- Objective: ${task.objective || 'Not set'}
- Description: ${task.description || 'Not set'}
- Status: ${task.status}
- Current Hours: ${task.hours || 0}

**Current Subtasks**:
${subtasksSummary}

**Documents**:
${docsSummary}

**Your Responsibilities**:
1. Clarify requirements and help refine the implementation plan.
2. Break down the task into subtasks if it's too large.
3. Identify technical risks or blockers.
4. Update the task status and hours based on user progress.

Use your tools to persist any changes to the database.
Keep your answers strategic, professional, and concise.`;

        // Define tools
        const tools = [
            {
                name: "update_plan",
                description: "Update the implementation plan (objective) of the task.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        reason: { type: "STRING", description: "Reason for update" },
                        content: { type: "STRING", description: "New plan content" }
                    },
                    required: ["reason", "content"]
                }
            },
            {
                name: "add_documents",
                description: "Add documentation links.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        links: {
                            type: "ARRAY",
                            description: "Array of document links",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING" },
                                    url: { type: "STRING" }
                                },
                                required: ["title", "url"]
                            }
                        }
                    },
                    required: ["links"]
                }
            },
            {
                name: "create_subtasks",
                description: "Create new subtasks.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        titles: {
                            type: "ARRAY",
                            description: "Array of subtask titles",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["titles"]
                }
            },
            {
                name: "update_hours",
                description: "Update estimated hours.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        hours: { type: "NUMBER", description: "New hour estimate" }
                    },
                    required: ["hours"]
                }
            },
            {
                name: "update_status",
                description: "Update status.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        status: {
                            type: "STRING",
                            description: "New status",
                            enum: ["PENDING", "IN PROGRESS", "WAITING FOR REVIEW", "DONE"]
                        }
                    },
                    required: ["status"]
                }
            }
        ];

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            tools: [{ functionDeclarations: tools }],
            systemInstruction: systemPrompt,
        });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        // Handle tool calls
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            console.log('Tool calls detected:', functionCalls.map(fc => fc.name));

            for (const fc of functionCalls) {
                try {
                    await executeToolCall(fc.name, fc.args, id);
                } catch (error) {
                    console.error(`Error executing tool ${fc.name}:`, error);
                }
            }
        }

        // Return streaming response
        const responseText = response.text() || 'Tools executed successfully.';

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                const words = responseText.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const word = words[i] + (i < words.length - 1 ? ' ' : '');
                    controller.enqueue(encoder.encode(word));
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return errorResponse(`Failed to process chat: ${error.message || 'Unknown error'}`, 500);
    }
}

// Tool execution functions
async function executeToolCall(toolName: string, args: any, taskId: string) {
    switch (toolName) {
        case 'update_plan':
            await prisma.task.update({ where: { id: taskId }, data: { objective: args.content } });
            break;

        case 'add_documents':
            await prisma.taskDocument.createMany({
                data: args.links.map((d: any) => ({
                    taskId: taskId,
                    title: d.title,
                    url: d.url,
                    type: 'link'
                }))
            });
            break;

        case 'create_subtasks':
            const parent = await prisma.task.findUnique({ where: { id: taskId } });
            if (!parent) return;
            const count = await prisma.task.count({ where: { parentId: taskId } });
            await Promise.all(args.titles.map((title: string, idx: number) =>
                prisma.task.create({
                    data: {
                        projectId: parent.projectId,
                        parentId: taskId,
                        title,
                        status: 'PENDING',
                        order: count + idx,
                        level: (parent.level || 0) + 1
                    }
                })
            ));
            break;

        case 'update_hours':
            await prisma.task.update({ where: { id: taskId }, data: { hours: args.hours } });
            break;

        case 'update_status':
            await prisma.task.update({ where: { id: taskId }, data: { status: args.status } });
            break;
    }
}
