import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function test() {
    try {
        console.log('Testing Bedrock...');
        console.log('Region:', process.env.AWS_REGION);
        const result = await generateText({
            model: bedrock('anthropic.claude-3-5-sonnet-20241022-v2:0'),
            prompt: 'Hello',
        });
        console.log('Result:', result.text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
