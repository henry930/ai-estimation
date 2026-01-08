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

async function verifyTraining(projectId: string, message: string) {
    console.log(`\n--- Verification: AI Following Master Instructions ---`);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: { orderBy: { order: 'asc' } } }
    });

    if (!project) return;

    // SIMULATE THE REAL SYSTEM PROMPT LOGIC FROM route.ts
    const projectSummary = `Project: ${project.name}`;
    const systemPrompt = `You are the AI Project Agent, a premium strategic lead for: "${project.name}".

## CORE RESPONSIBILITIES
1. Strategic Oversight.
2. Structure & Hierarchy.
3. Artifact Creation.
4. Execution Detail.

## TRAINING PROTOCOLS
- Direct Execution.
- Tone: Technical, professional.
- S3 Persistence.

## CURRENT PROJECT CONTEXT (from RDS)
${projectSummary}

${project.aiInstructions ? `## MASTER PROJECT INSTRUCTIONS (Persistent Training)
${project.aiInstructions}` : ''}`;

    console.log(`Master Instructions Injected:\n${project.aiInstructions}\n`);

    try {
        const { text, toolCalls } = await generateText({
            model: getModel(),
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
            tools: {
                restructurePlan: createTool({
                    description: 'Restructure plan',
                    parameters: z.object({
                        phases: z.array(z.object({
                            title: z.string(),
                            tasks: z.array(z.object({ title: z.string(), hours: z.number() }))
                        }))
                    }),
                    execute: async () => ({ success: true })
                }),
                upsertImplementationPlan: createTool({
                    description: 'Create implementation plan',
                    parameters: z.object({ taskId: z.string(), planContent: z.string() }),
                    execute: async () => ({ success: true })
                })
            },
            maxSteps: 5
        });

        console.log(`--- Agent's Following Response ---`);
        console.log(text);

        if (toolCalls && toolCalls.length > 0) {
            console.log(`\n--- Tools Called (Verifying Buffer & Security) ---`);
            toolCalls.forEach(tc => {
                console.log(`Tool: ${tc.toolName}`);
                console.log(`Args: ${JSON.stringify(tc.args, null, 2)}`);
            });
        }

    } catch (err) {
        console.error('Verification Error:', err);
    }
}

const pId = 'cmk2uz5xv0009kn3zjbuhp73i';
const msg = "Please add a new phase called 'User Gateway' with a 'Login Service' task. Follow our master protocol.";

verifyTraining(pId, msg).finally(() => prisma.$disconnect());
