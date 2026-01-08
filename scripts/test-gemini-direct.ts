import { callGeminiWithTools } from '../src/lib/gemini-direct';

async function test() {
    console.log('--- TESTING DIRECT GEMINI INTEGRATION ---');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY not found');
        return;
    }

    const tools = [
        {
            name: 'create_phase',
            description: 'Create a new project phase',
            parameters: {
                type: 'object' as const,
                properties: {
                    title: { type: 'string', description: 'Phase title' },
                    objective: { type: 'string', description: 'Phase objective' },
                    order: { type: 'number', description: 'Phase order' },
                },
                required: ['title', 'objective', 'order'],
            },
        },
        {
            name: 'add_tasks',
            description: 'Add tasks to a phase',
            parameters: {
                type: 'object' as const,
                properties: {
                    groupId: { type: 'string', description: 'Phase ID' },
                    tasks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                hours: { type: 'number' },
                                order: { type: 'number' },
                            },
                            required: ['title', 'order'],
                        },
                    },
                },
                required: ['groupId', 'tasks'],
            },
        },
    ];

    try {
        const result = await callGeminiWithTools(
            apiKey,
            'Create a new phase called "Testing Phase" with objective "Test the system" and order 1',
            tools,
            'You are a project management AI assistant.'
        );

        console.log('Response Text:', result.text);
        console.log('Tool Calls:', JSON.stringify(result.toolCalls, null, 2));

        if (result.toolCalls.length > 0) {
            console.log('✅ SUCCESS: Tool calling works!');
        } else {
            console.log('⚠️  No tool calls detected');
        }
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);
    }
}

test().catch(console.error);
