import { PrismaClient } from '@prisma/client';
import { generateText, tool as createTool } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function getModel() {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const bedrock = createAmazonBedrock({
            accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1',
        });
        return bedrock('us.anthropic.claude-3-5-sonnet-20240620-v1:0');
    }
    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });
    return google('gemini-2.0-flash-exp');
}

async function runAgent(projectId: string, message: string) {
    console.log(`\n--- AI Strategic Agent (CLI Mode) ---`);
    console.log(`Target Project: ${projectId}`);
    console.log(`User Input: "${message}"\n`);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: { orderBy: { order: 'asc' } } }
    });

    if (!project) {
        console.error('Project not found');
        return;
    }

    const phases = project.tasks.filter(t => t.level === 0);
    const tasks = project.tasks.filter(t => t.level === 1);

    const projectSummary = `
Project Name: ${project.name}
Objective: ${project.objective || 'N/A'}
Task Structure:
${phases.map(g => `Phase: ${g.title} (ID: ${g.id})\n${tasks.filter(t => t.parentId === g.id).map(t => `- Task: ${t.title} (${t.hours}h) [ID: ${t.id}]`).join('\n')}`).join('\n')}
    `;

    const systemPrompt = `You are a premium strategic lead for "${project.name}".
    
## YOUR MISSION
Transform high-level requirements into a structured, executable project plan. 

Current Summary: ${projectSummary}`;

    try {
        const { text, toolResults } = await generateText({
            model: getModel(),
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
            tools: {
                restructurePlan: createTool({
                    description: 'Completely restructure the project plan',
                    parameters: z.object({
                        phases: z.array(z.object({
                            title: z.string(),
                            objective: z.string(),
                            tasks: z.array(z.object({
                                title: z.string(),
                                description: z.string(),
                                hours: z.number()
                            }))
                        }))
                    }),
                    execute: async ({ phases }) => {
                        console.log(`[Executing Tool] restructurePlan with ${phases.length} phases`);
                        return { success: true };
                    }
                }),
                generateReport: createTool({
                    description: 'Generate report',
                    parameters: z.object({ title: z.string(), content: z.string(), type: z.string() }),
                    execute: async (args) => {
                        console.log(`[Executing Tool] generateReport: ${args.title}`);
                        return { success: true, url: 's3://mock/report.md' };
                    }
                }),
                upsertImplementationPlan: createTool({
                    description: 'Upsert Implementation Plan',
                    parameters: z.object({ taskId: z.string(), planContent: z.string() }),
                    execute: async ({ taskId }) => {
                        console.log(`[Executing Tool] upsertImplementationPlan for task ${taskId}`);
                        return { success: true, url: 's3://mock/plan.md' };
                    }
                })
            },
            maxSteps: 5
        });

        console.log(`\n--- Agent Response ---`);
        console.log(text);

        if (toolResults.length > 0) {
            console.log(`\n--- Tool Results ---`);
            toolResults.forEach((tr, i) => {
                console.log(`${i + 1}. ${tr.toolName}: ${JSON.stringify(tr.result)}`);
            });
        }

    } catch (err) {
        console.error('Agent Execution Error:', err);
    }
}

const pId = process.argv[2] || 'cmk2uz5xv0009kn3zjbuhp73i';
const msg = process.argv[3] || "Analyze the project and restructure it for a SaaS deployment. Then create an implementation plan for the primary database task.";

runAgent(pId, msg).then(() => prisma.$disconnect());
