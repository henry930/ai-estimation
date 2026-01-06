'use client';

import { useState, useRef, useEffect } from 'react';
import { XIcon, SendIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import MessageList, { Message } from '../chat/MessageList';

interface AIEnquiryPanelProps {
    taskId?: string;
    groupId?: string;
    taskTitle: string;
    onClose: () => void;
    hideHeader?: boolean;
}

export default function AIEnquiryPanel({ taskId, groupId, taskTitle, onClose, hideHeader }: AIEnquiryPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleQuickSend = async (content: string) => {
        if (isLoading) return;
        await processSend(content);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const currentInput = input;
        setInput('');
        await processSend(currentInput);
    };

    const processSend = async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            const res = await fetch('/api/admin/tasks/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    groupId,
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!res.body) throw new Error('No body');

            const reader = res.body.getReader();
            const decoder = new TextEncoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                fullContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === assistantMessageId ? { ...m, content: fullContent } : m
                ));
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl relative overflow-hidden">
            {/* Header */}
            {!hideHeader && (
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <SparklesIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white leading-none">Task AI Assistant</h2>
                            <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[200px]">{taskTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                    >
                        <XIcon className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 mb-4 animate-pulse">
                            <SparklesIcon className="w-8 h-8 text-blue-500/40" />
                        </div>
                        <h3 className="text-white text-base font-semibold">How can I help with this task?</h3>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-[240px]">
                            Ask about the implementation details, branch strategy, or request a technical breakdown.
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[320px] mt-6">
                            {[
                                "Update the estimation",
                                "Kick start now",
                                "Break down subtasks",
                                "Branch strategy",
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const suggestion = ["Update the estimation", "Kick start now", "Break down subtasks", "Branch strategy"][idx];
                                        // We use a small timeout to ensure the state update is processed if needed, 
                                        // but actually we can just call handleSend with the suggestion directly.
                                        handleQuickSend(suggestion);
                                    }}
                                    className="px-4 py-2 text-[11px] font-medium text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:text-white transition-all text-left"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <MessageList messages={messages} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#080808] border-t border-white/5">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-10 group-focus-within:opacity-20 transition duration-500" />
                    <div className="relative flex items-end gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl p-2 focus-within:border-blue-500/50 transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask anything about this task..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-600 resize-none min-h-[44px] max-h-[120px] py-2.5 px-3"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-2.5 rounded-lg transition-all ${input.trim() && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                                <SendIcon className="w-4 h-4 fill-current" />
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-center text-gray-600 mt-3 select-none">
                    AI powered task assistance • Markdown supported
                </p>
            </div>
        </div>
    );
}
