
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key',
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages } = await req.json();

    // If no API key is present, return a mock streaming response
    if (!process.env.OPENAI_API_KEY) {
        const mockStream = new ReadableStream({
            start(controller) {
                const text = "I am a mock AI assistant. Please configure your OPENAI_API_KEY to get real responses.\n\nI can help you estimate tasks, break down requirements, and suggest code changes.";
                const encoder = new TextEncoder();
                let i = 0;
                const interval = setInterval(() => {
                    if (i < text.length) {
                        controller.enqueue(encoder.encode(text[i]));
                        i++;
                    } else {
                        clearInterval(interval);
                        controller.close();
                    }
                }, 20); // Simulate typing speed
            }
        });
        return new StreamingTextResponse(mockStream);
    }

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: [
            { role: 'system', content: 'You are an expert technical project manager and software architect. Help the user break down tasks, estimate hours, and simplify complex requirements. Be concise and practical.' },
            ...messages
        ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}
