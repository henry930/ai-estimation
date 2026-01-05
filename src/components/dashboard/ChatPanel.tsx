'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';

interface ChatPanelProps {
    taskId?: string;
    onTaskUpdate?: (updates: any) => void;
}

export default function ChatPanel({ taskId, onTaskUpdate }: ChatPanelProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: { taskId },
        initialInput: ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();

        // Check last AI message for task updates
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            try {
                // Look for JSON in code blocks
                const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[1]);
                    if (data.action === 'update_task' && data.updates && onTaskUpdate) {
                        onTaskUpdate(data.updates);
                    }
                }
            } catch (e) {
                // Not a JSON update, ignore
            }
        }
    }, [messages, onTaskUpdate]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-white">AI Assistant</h3>
                <p className="text-xs text-gray-500">Ask for help with this task</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p>No messages yet.</p>
                        <p className="mt-2">Try asking: "Break down this task"</p>
                    </div>
                )}

                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white/10 text-gray-200 rounded-bl-none'
                            }`}>
                            <span className="font-bold text-[10px] opacity-50 block mb-1 uppercase tracking-wider">
                                {m.role === 'user' ? 'You' : 'AI'}
                            </span>
                            {m.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
