import { generateText, tool } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

async function runRepro() {
    console.log('--- STARTING ANTHROPIC TOOL TEST ---');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        console.error('ANTHROPIC_API_KEY not found');
        return;
    }

    const anthropic = createAnthropic({ apiKey });
    const model = anthropic('claude-3-haiku-20240307');

    const tools = {
        test_tool: tool({
            description: 'A simple test tool',
            parameters: z.object({
                message: z.string()
            }),
            execute: async ({ message }) => {
                console.log('Tool test_tool called with:', message);
                return `Echo: ${message}`;
            }
        })
    };

    try {
        console.log('Calling generateText with Anthropic...');
        const result = await generateText({
            model,
            prompt: 'Call the test tool with "Hello".',
            tools,
        });

        console.log('AI Response:', result.text);
        if (result.toolCalls && result.toolCalls.length > 0) {
            console.log('Tool Calls detected:', result.toolCalls.map(tc => tc.toolName));
            console.log('Results:', JSON.stringify(result.toolResults, null, 2));
        } else {
            console.log('No tool calls detected.');
        }
    } catch (error: any) {
        console.error('--- TEST FAILED ---');
        console.error('Error Message:', error.message);
        if (error.responseBody) console.error('Response Body:', error.responseBody);
    }
}

runRepro().catch(console.error);
