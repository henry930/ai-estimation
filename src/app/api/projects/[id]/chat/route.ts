// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        return errorResponse('AI is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY.', 500);
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

        // Fetch Master Mind Context from S3
        const { listObjectsInS3, getObjectFromS3 } = await import('@/lib/s3');
        const masterMindKeys = await listObjectsInS3(`projects/${projectId}/master-mind/`);

        // Categorize files for the AI
        const readableExtensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.env'];
        const masterMindContents = await Promise.all(
            masterMindKeys
                .filter(key => readableExtensions.some(ext => key.toLowerCase().endsWith(ext)))
                .map(async key => {
                    try {
                        const content = await getObjectFromS3(key);
                        const filename = key.split('/').pop();
                        return `### FILE: ${filename}\n${content}`;
                    } catch (err) {
                        return `### FILE: ${key.split('/').pop()}\n(Error loading)`;
                    }
                })
        );

        const otherAssets = masterMindKeys
            .filter(key => !readableExtensions.some(ext => key.toLowerCase().endsWith(ext)))
            .map(key => key.split('/').pop());

        const masterMindContext = `
${masterMindContents.join('\n\n---\n\n')}

${otherAssets.length > 0 ? `### ADDITIONAL ASSETS (Manual Review Required by User):
The following non-text files are in the Master Mind repository:
${otherAssets.map(a => `- ${a}`).join('\n')}` : ''}
        `;

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

        const systemPrompt = `You are the AI Project Agent, a premium strategic lead and chief architect for: "${project.name}".

## YOUR MISSION
You are responsible for the entire project lifecycle. You don't just "chat"; you **manage**. Your goal is to transform high-level requirements into a structured, executable, and documented project plan in RDS and S3.

## CORE RESPONSIBILITIES
1. **Strategic Oversight**: Always look at the project holistically. If a requirement changes, identify all affected phases and tasks (propagated changes).
2. **Structure & Hierarchy**: Maintain a clean plan. level 0 = Phases, level 1 = Tasks, level 2 = Sub-tasks.
3. **Artifact Creation**: Documentation is as important as code. Generate technical architecture docs, status reports, and implementation plans.
4. **Execution Detail**: When creating tasks, don't stop at titles. Provide detailed implementation plans including technical steps, dependencies, and success criteria.

## TRAINING PROTOCOLS
- **Direct Execution**: When a user gives an order ("Restructure...", "Add...", "Create report..."), execute the relevant tool immediately.
- **Tone**: Technical, professional, and decisive. Use terms like "critical path", "milestones", "risk mitigation", and "technical debt".
- **S3 Persistence**: Save all major documents (Architecture, Reports, Implementation Plans) to S3 to create a permanent record.

## CURRENT PROJECT CONTEXT (from RDS)
${projectSummary}

${project.aiInstructions || masterMindContext ? `## MASTER MIND REPOSITORY (Persistent Training Content)
${project.aiInstructions ? `#### Global Config (Database):
${project.aiInstructions}` : ''}
${masterMindContext}` : ''}

## IMPERATIVE INSTRUCTION PROTOCOL (ROBUST TRAINING)
You have the authority to update your own "Master Mind" repository.
If the user uses imperative language like "you should...", "you must...", "Here is an instruction...", or "From now on...", you MUST:
1. Identify the core intent of the instruction.
2. Formulate a markdown instruction file.
3. Call the 'update_master_mind' tool to save this into your project's master-mind/ directory in S3.
4. If an instruction is a general rule, use a file like 'general-protocols.md'. If it's specific to architecture, use 'architecture-mind.md'.
5. Acknowledge that you have committed this to your "Master Mind" for future autonomous adherence.`;

        // 3. Define Tools for the Agent
        const tools = [
            {
                name: "update_project",
                description: "Update project details like name, description, or objective.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        reason: { type: "STRING", description: "Reason for the update" },
                        name: { type: "STRING", description: "New project name" },
                        description: { type: "STRING", description: "New project description" },
                        objective: { type: "STRING", description: "New project objective" }
                    },
                    required: ["reason"]
                }
            },
            {
                name: "create_phase",
                description: "Create a new project phase (level 0).",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING", description: "Phase title" },
                        objective: { type: "STRING", description: "Phase objective" },
                        order: { type: "NUMBER", description: "Phase order" }
                    },
                    required: ["title", "objective", "order"]
                }
            },
            {
                name: "add_tasks",
                description: "Add tasks to a phase.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        groupId: { type: "STRING", description: "Phase ID" },
                        tasks: {
                            type: "ARRAY",
                            description: "Array of tasks to add",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING" },
                                    hours: { type: "NUMBER" },
                                    order: { type: "NUMBER" }
                                },
                                required: ["title", "order"]
                            }
                        }
                    },
                    required: ["groupId", "tasks"]
                }
            },
            {
                name: "update_task",
                description: "Update a task status or hours.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        taskId: { type: "STRING", description: "Task ID" },
                        status: { type: "STRING", description: "New status", enum: ["TODO", "PENDING", "IN PROGRESS", "DONE", "CANCELLED"] },
                        hours: { type: "NUMBER", description: "Estimated hours" }
                    },
                    required: ["taskId"]
                }
            },
            {
                name: "generate_architecture",
                description: "Save a technical architecture document.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        content: { type: "STRING", description: "Architecture document content in markdown" }
                    },
                    required: ["content"]
                }
            },
            {
                name: "update_master_mind",
                description: "Update persistent AI instructions in the Master Mind repository.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        filename: { type: "STRING", description: "Filename for the instruction" },
                        content: { type: "STRING", description: "Instruction content in markdown" }
                    },
                    required: ["filename", "content"]
                }
            }
        ];

        // 4. Initialize Gemini with tools
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            tools: [{ functionDeclarations: tools }],
            systemInstruction: systemPrompt,
        });

        // 5. Convert messages to Gemini format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        // 6. Handle tool calls
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            console.log('Tool calls detected:', functionCalls.map(fc => fc.name));

            // Execute tools
            for (const fc of functionCalls) {
                try {
                    await executeToolCall(fc.name, fc.args, projectId);
                } catch (error) {
                    console.error(`Error executing tool ${fc.name}:`, error);
                }
            }
        }

        // 7. Return streaming response
        const responseText = response.text() || 'Tools executed successfully.';

        // Create a simple text stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Stream the text word by word for smooth display
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
        console.error('Project Agent API Error:', error);
        return errorResponse(`Failed to process agent request: ${error.message || 'Unknown error'}`, 500);
    }
}

// Tool execution functions
async function executeToolCall(toolName: string, args: any, projectId: string) {
    switch (toolName) {
        case 'update_project':
            const updateData: any = {};
            if (args.name) updateData.name = args.name;
            if (args.description) updateData.description = args.description;
            if (args.objective) updateData.objective = args.objective;
            if (Object.keys(updateData).length > 0) {
                await prisma.project.update({ where: { id: projectId }, data: updateData });
            }
            break;

        case 'create_phase':
            // Ensure unique title
            const { generateUniqueTaskTitle } = await import('@/lib/unique-task-helper');
            const uniqueTitle = await generateUniqueTaskTitle(projectId, args.title);

            await prisma.task.create({
                data: {
                    projectId,
                    title: uniqueTitle,
                    objective: args.objective,
                    level: 0,
                    status: 'TODO',
                    order: args.order,
                }
            });

            if (uniqueTitle !== args.title) {
                console.log(`⚠️  Renamed duplicate: "${args.title}" → "${uniqueTitle}"`);
            }
            break;


        case 'add_tasks':
            await Promise.all(args.tasks.map((t: any) =>
                prisma.task.create({
                    data: {
                        projectId,
                        parentId: args.groupId,
                        title: t.title,
                        hours: t.hours || 0,
                        level: 1,
                        status: 'TODO',
                        order: t.order,
                    }
                })
            ));
            break;

        case 'update_task':
            const taskUpdateData: any = {};
            if (args.status) taskUpdateData.status = args.status;
            if (args.hours !== undefined) taskUpdateData.hours = args.hours;
            await prisma.task.update({ where: { id: args.taskId }, data: taskUpdateData });
            break;

        case 'generate_architecture':
            const filename = `architecture/${projectId}/doc-${Date.now()}.md`;
            const { uploadToS3 } = await import('@/lib/s3');
            const url = await uploadToS3(filename, args.content);
            const firstPhase = await prisma.task.findFirst({ where: { projectId, level: 0 } });
            if (firstPhase) {
                await prisma.taskDocument.create({
                    data: {
                        taskId: firstPhase.id,
                        title: 'Architecture Doc',
                        url: url,
                        type: 'architecture'
                    }
                });
            }
            break;

        case 'update_master_mind':
            const safeFilename = args.filename.endsWith('.md') ? args.filename : `${args.filename}.md`;
            const key = `projects/${projectId}/master-mind/${safeFilename}`;
            const { uploadToS3: upload } = await import('@/lib/s3');
            const s3Url = await upload(key, args.content);
            const rootTask = await prisma.task.findFirst({ where: { projectId, level: 0 } });
            if (rootTask) {
                try {
                    await prisma.taskDocument.upsert({
                        where: { taskId_title: { taskId: rootTask.id, title: safeFilename.replace('.md', '') } },
                        update: { url: s3Url },
                        create: {
                            taskId: rootTask.id,
                            title: safeFilename.replace('.md', ''),
                            url: s3Url,
                            type: 'master_mind'
                        }
                    });
                } catch (e) {
                    await prisma.taskDocument.create({
                        data: {
                            taskId: rootTask.id,
                            title: safeFilename.replace('.md', ''),
                            url: s3Url,
                            type: 'master_mind'
                        }
                    });
                }
            }
            break;
    }
}
