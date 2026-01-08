/**
 * Direct test of Gemini integration with project context
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWithRealProject() {
    console.log('🧪 Testing Gemini with Real Project Data...\n');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY not set');
        return;
    }

    // Get first project
    const project = await prisma.project.findFirst({
        include: {
            tasks: {
                include: { documents: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!project) {
        console.error('❌ No projects in database');
        return;
    }

    console.log(`✅ Testing with project: ${project.name}\n`);

    // Define tools
    const tools = [
        {
            name: "create_phase",
            description: "Create a new project phase",
            parameters: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING", description: "Phase title" },
                    objective: { type: "STRING", description: "Phase objective" },
                    order: { type: "NUMBER", description: "Phase order" }
                },
                required: ["title", "objective", "order"]
            }
        }
    ];

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [{ functionDeclarations: tools }],
        systemInstruction: `You are managing project: ${project.name}`,
    });

    // Test 1: Simple chat
    console.log('Test 1: Simple overview request...');
    const chat1 = model.startChat();
    const result1 = await chat1.sendMessage('Give me a one-sentence overview of this project.');
    const response1 = await result1.response;
    console.log('✅ Response:', response1.text().substring(0, 150) + '...\n');

    // Test 2: Tool calling
    console.log('Test 2: Create a test phase...');
    const chat2 = model.startChat();
    const result2 = await chat2.sendMessage('Create a new phase called "API Testing Phase" with objective "Test Gemini integration" and order 100');
    const response2 = await result2.response;

    const functionCalls = response2.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
        console.log('✅ Tool calls detected:', functionCalls.map(fc => fc.name));
        console.log('   Arguments:', JSON.stringify(functionCalls[0].args, null, 2));

        // Actually create the phase
        const args = functionCalls[0].args;
        const newPhase = await prisma.task.create({
            data: {
                projectId: project.id,
                title: args.title,
                objective: args.objective,
                level: 0,
                status: 'TODO',
                order: args.order,
            }
        });
        console.log('✅ Phase created in database:', newPhase.id);
    } else {
        console.log('❌ No tool calls detected');
        console.log('   Response:', response2.text());
    }

    await prisma.$disconnect();
    console.log('\n🎉 All tests completed!');
}

testWithRealProject().catch(console.error);
