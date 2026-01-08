import { google } from '@ai-sdk/google';
import { generateText, tool as createTool } from 'ai';
import { z } from 'zod';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function runTest() {
    console.log('--- STARTING GEMINI TOOL TEST (STABLE MODEL) ---');

    if (!apiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY not found');
        return;
    }

    const model = google('gemini-1.5-pro-002');

    const tools = {
        testTool: createTool({
            description: 'A test tool',
            parameters: z.object({
                value: z.string()
            }),
            execute: async ({ value }) => ({ success: true, value })
        })
    };

    try {
        console.log('Calling generateText with tool...');
        const result = await generateText({
            model,
            system: 'Use the tool.',
            prompt: 'Call the test tool with "test-value".',
            tools,
        });

        console.log('AI Response:', result.text);
        if (result.toolCalls && result.toolCalls.length > 0) {
            console.log('Tool Calls detected:', result.toolCalls.map(tc => tc.toolName));
        }
        console.log('--- TEST FINISHED SUCCESSFULLY ---');
    } catch (error: any) {
        console.error('--- TEST FAILED ---');
        console.error('Error Message:', error.message);
        if (error.responseBody) console.error('Response Body:', error.responseBody);
    }
}

runTest().catch(console.error);
