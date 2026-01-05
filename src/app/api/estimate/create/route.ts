import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { openai, isAIConfigured } from '@/lib/openai';
import { SYSTEM_Prompt, ESTIMATION_PROMPT } from '@/lib/prompts';
import { checkUsage } from '@/lib/subscription';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { requirements, projectId } = body;

        if (!requirements || !projectId) {
            return errorResponse('Missing requirements or projectId', 400);
        }

        // Verify project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            // For development without auth/project flow fully connected, we might want to auto-create a project if it doesn't exist, 
            // OR return error. Let's return error to be strict, but User should ensure project exists.
            // For this phase, we assume the frontend sends a valid ID or we handle it gracefully.
            return errorResponse('Project not found', 404);
        }

        // Check Usage Limit (Phase 4.5)
        // Note: project.userId is guaranteed if project exists, but let's be safe
        const canCreate = await checkUsage(project.userId);
        if (!canCreate) {
            return errorResponse('Monthly estimation limit reached. Please upgrade your plan.', 403);
        }

        let estimationData;

        if (isAIConfigured()) {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4', // or gpt-3.5-turbo if cost is concern
                messages: [
                    { role: 'system', content: SYSTEM_Prompt },
                    { role: 'user', content: ESTIMATION_PROMPT + '\n' + requirements }
                ],
                temperature: 0.2, // Low temperature for consistent structural output
            });

            const content = completion.choices[0]?.message?.content || '{}';
            try {
                estimationData = JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse AI response', e);
                return errorResponse('Failed to parse AI response', 500);
            }

        } else {
            // MOCK DATA FALLBACK
            console.log('Using Mock Estimation Data');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
            estimationData = {
                phases: [
                    {
                        name: 'Phase 1: Foundation',
                        tasks: [
                            { name: 'Setup Project', description: 'Initialize repo and dependencies', hours: 4, complexity: 'Low' },
                            { name: 'Database Design', description: 'Define schema and migrations', hours: 6, complexity: 'Medium' }
                        ]
                    },
                    {
                        name: 'Phase 2: Core Features',
                        tasks: [
                            { name: 'API Implementation', description: 'Build core endpoints', hours: 12, complexity: 'High' },
                            { name: 'Frontend Components', description: 'React components and styling', hours: 16, complexity: 'Medium' }
                        ]
                    }
                ],
                summary: "Based on the requirements, this is a standard web application. We recommend Next.js and Prisma.",
                totalHours: 38,
                recommendedStack: ["Next.js", "Prisma", "PostgreSQL"]
            };
        }

        // Save to Database
        // Note: SQLite schema uses String for JSON fields.
        const estimation = await prisma.estimation.create({
            data: {
                projectId: projectId,
                tasks: JSON.stringify(estimationData.phases), // Storing phases breakdown
                totalHours: estimationData.totalHours,
                minHours: Math.floor(estimationData.totalHours * 0.9),
                maxHours: Math.ceil(estimationData.totalHours * 1.2),
                cost: estimationData.totalHours * 150, // Assumption: $150/hr
                currency: 'USD',
                status: 'draft'
            }
        });

        return successResponse({
            estimation,
            summary: estimationData.summary,
            recommendedStack: estimationData.recommendedStack
        });

    } catch (error) {
        console.error('Estimation Creation Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
