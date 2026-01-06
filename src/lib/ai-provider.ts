import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export function getAIModel(): LanguageModel {
    // 1. Check for Bedrock first (User's preference)
    const hasBedrock = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
        !!(process.env.BEDROCK_AWS_ACCESS_KEY_ID && process.env.BEDROCK_AWS_SECRET_ACCESS_KEY);

    if (hasBedrock) {
        const bedrock = createAmazonBedrock({
            accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.BEDROCK_AWS_REGION || process.env.AWS_REGION || 'eu-west-1',
        });

        // Use Claude 4.5 Sonnet (Latest model as requested)
        return bedrock('eu.anthropic.claude-sonnet-4-5-20250929-v1:0');
    }

    // 2. Fallback to OpenAI
    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
    });

    return openai('gpt-4o-mini');
}

export const isAIConfigured = () => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-openai-key';
    const hasBedrock = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    return hasOpenAI || hasBedrock;
};
