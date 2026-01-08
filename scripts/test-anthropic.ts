import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

async function runTest() {
    console.log('--- STARTING ANTHROPIC TOOL TEST (RAW) ---');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        console.error('ANTHROPIC_API_KEY not found');
        return;
    }

    const anthropic = createAnthropic({ apiKey });
    const model = anthropic('claude-3-haiku-20240307');

    const tools = {
        testTool: {
            description: 'A test tool',
            parameters: {
                type: 'object',
                properties: {
                    value: { type: 'string' }
                },
                required: ['value']
            },
            execute: async ({ value }: { value: string }) => ({ success: true, value })
        }
    };

    try {
        console.log('Calling generateText (Raw Tools)...');
        const result = await generateText({
            model,
            prompt: 'Call the test tool with "raw-is-better".',
            tools,
        });

        console.log('AI Response:', result.text);
        if (result.toolCalls && result.toolCalls.length > 0) {
            console.log('Tool Calls detected:', result.toolCalls.map(tc => tc.toolName));
            console.log('Result:', JSON.stringify(result.toolResults, null, 2));
        }
        console.log('--- TEST FINISHED SUCCESSFULLY ---');
    } catch (error: any) {
        console.error('--- TEST FAILED ---');
        console.error('Error Message:', error.message);
        if (error.responseBody) console.error('Response Body:', error.responseBody);
    }
}

runTest().catch(console.error);
