import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { LanguageModel } from 'ai';

export function getAIModel(): LanguageModel {
    // 1. Try Google Gemini 2.0 (Primary)
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        // Note: There's a known issue with AI SDK 6.0.20 and Gemini tool calling
        // The official Google SDK works fine, but AI SDK has schema conversion issues
        // Using gemini-2.0-flash-exp for now
        console.log('--- PROVIDER: Using Google Gemini 2.0 Flash Exp ---');
        return google('gemini-2.0-flash-exp');

    }

    // 2. Try Anthropic Haiku (Backup)
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('--- PROVIDER: Falling back to Anthropic Claude 3 Haiku ---');
        const anthropic = createAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        return anthropic('claude-3-haiku-20240307');
    }

    // 3. Try Bedrock
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('--- PROVIDER: Falling back to AWS Bedrock (Claude 3.5 Sonnet) ---');
        const bedrock = createAmazonBedrock({
            accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1',
        });
        return bedrock('us.anthropic.claude-3-5-sonnet-20240620-v1:0');
    }

    console.log('--- PROVIDER: Falling back to OpenAI (Dummy) ---');
    return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
    })('gpt-4o-mini');
}

export const isAIConfigured = () => {
    const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-openai-key';
    const hasBedrock = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    return hasGoogle || hasAnthropic || hasOpenAI || hasBedrock;
};
