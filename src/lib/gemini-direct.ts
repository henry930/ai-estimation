/**
 * Direct Gemini integration bypassing AI SDK
 * This is a workaround for AI SDK 6.0.20 tool calling schema issues
 */

import { GoogleGenerativeAI } from "@google/generative-ai";


export interface GeminiTool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
    };
}

export async function callGeminiWithTools(
    apiKey: string,
    prompt: string,
    tools: GeminiTool[],
    systemPrompt?: string
): Promise<{
    text: string;
    toolCalls: Array<{ name: string; args: any }>;
}> {
    const genAI = new GoogleGenerativeAI(apiKey);

    const functionDeclarations = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
            type: "OBJECT" as const,
            properties: tool.parameters.properties,
            required: tool.parameters.required,
        },

    }));

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
        systemInstruction: systemPrompt,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    return {
        text: response.text(),
        toolCalls: response.functionCalls()?.map(fc => ({
            name: fc.name,
            args: fc.args,
        })) || [],
    };
}
