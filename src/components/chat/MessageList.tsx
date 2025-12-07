'use client';

import { useEffect, useRef } from "react";

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
}

export default function MessageList({ messages }: { messages: Message[] }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <div
                        className={`max-w-[75%] rounded-2xl px-6 py-4 ${message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : message.role === 'assistant'
                                    ? 'bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-bl-none shadow-sm'
                                    : 'bg-transparent text-gray-500 text-sm justify-center w-full text-center border-none shadow-none'
                            }`}
                    >
                        {/* Role Label */}
                        {message.role !== 'system' && (
                            <div className={`text-xs font-semibold mb-2 ${message.role === 'user' ? 'text-blue-200' : 'text-purple-400'}`}>
                                {message.role === 'user' ? 'You' : 'AI Architect'}
                            </div>
                        )}

                        <div className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
