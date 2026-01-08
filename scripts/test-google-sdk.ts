import { GoogleGenerativeAI } from "@google/generative-ai";

async function runTest() {
    console.log('--- STARTING OFFICIAL GOOGLE SDK TOOL TEST ---');
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY not found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",

        tools: [
            {
                functionDeclarations: [
                    {
                        name: "test_tool",
                        description: "A simple test tool",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                message: { type: "STRING" }
                            },
                            required: ["message"]
                        },
                    },
                ],
            },
        ],
    });

    const chat = model.startChat();
    try {
        console.log("Sending message...");
        const result = await chat.sendMessage('Call the test tool with "Hello".');
        const response = await result.response;
        console.log("AI Response:", response.text());
        const toolCalls = response.functionCalls();
        if (toolCalls) {
            console.log("Tool Calls detected:", toolCalls);
        } else {
            console.log("No tool calls detected.");
        }
        console.log("--- TEST FINISHED SUCCESSFULLY ---");
    } catch (error: any) {
        console.error("--- TEST FAILED ---");
        console.error(error);
    }
}

runTest().catch(console.error);
