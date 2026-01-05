
'use client';

import { useChat } from 'ai';
import { useRef, useEffect } from 'react';

export default function ChatPanel() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-white">AI Assistant</h3>
                <p className="text-xs text-gray-500">Ask for help with estimation or breakdown</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p>No messages yet.</p>
                        <p className="mt-2">Try asking: "Break down the authentication task"</p>
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
                        <div className="bg-white/10 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm max-w-[85%]">
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
                <div className="relative">
                    <input
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 text-white hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transform rotate-90">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
