import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true, // Allow client-side use if strictly necessary (usually server-only)
});

export const isAIConfigured = () => {
    return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key';
};

// Singleton pattern not strictly necessary for OpenAI client as it's stateless, 
// but good for consistent config injection if needed later.
