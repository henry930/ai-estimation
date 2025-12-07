import { OpenAI } from 'openai';

export async function streamToResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    onToken?: (token: string) => void
) {
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        if (onToken) onToken(content);
                        controller.enqueue(encoder.encode(content));
                    }
                }
            } catch (err) {
                console.error('Stream Error', err);
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
