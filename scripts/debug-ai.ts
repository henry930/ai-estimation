import { streamText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';

async function test() {
    try {
        console.log('Testing Bedrock with Inference Profile...');
        const result = await streamText({
            model: bedrock('eu.anthropic.claude-3-5-sonnet-20240620-v1:0'),
            prompt: 'Hi',
        });
        console.log('Result keys:', Object.keys(result));
        console.log('Result methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(result)));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
