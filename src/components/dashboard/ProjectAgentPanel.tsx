'use client';

import { useState, useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon, Loader2Icon, BotIcon, CheckIcon, XIcon } from 'lucide-react';
import MessageList, { Message } from '../chat/MessageList';

interface ProjectAgentPanelProps {
    projectId: string;
    projectName: string;
}

export default function ProjectAgentPanel({ projectId, projectName }: ProjectAgentPanelProps) {
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
            const res = await fetch(`/api/projects/${projectId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
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

            // Refresh the page to show updated tasks
            // Small delay to ensure database writes complete
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            console.error('Project Agent error:', err);
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
            ));
        } finally {
            setIsLoading(false);
        }

    };



    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <BotIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-none">AI Project Agent</h2>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{projectName}</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mb-2 shadow-xl shadow-purple-900/20">
                            <SparklesIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h3 className="text-white text-xl font-semibold">How can I help you manage {projectName}?</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                I can help you restructure the project, add detailed tasks, or refine estimation hours. I have full access to modify the project plan.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                            {[
                                "Add a 'Development' phase",
                                "Create tasks for User Auth",
                                "Refine the description",
                                "Audit current estimations"
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickSend(suggestion)}
                                    className="px-4 py-3 text-sm text-gray-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-purple-500/30 hover:text-white transition-all text-left flex items-center gap-3 group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-purple-500/30 group-hover:bg-purple-500 transition-colors" />
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
            <div className="p-4 md:p-6 bg-black border-t border-white/10">
                <div className="max-w-4xl mx-auto relative">
                    <div className="relative flex items-end gap-3 bg-[#111] border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all shadow-xl">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message Project Agent..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500 resize-none min-h-[44px] max-h-[200px] py-3 px-4"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-2.5 rounded-xl transition-all mb-1 mr-1 ${input.trim() && !isLoading
                                ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2Icon className="w-5 h-5 animate-spin" />
                            ) : (
                                <SendIcon className="w-5 h-5 fill-current" />
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-600 mt-3">
                        AI can make mistakes. Please review generated plans.
                    </p>
                </div>
            </div>
        </div>
    );
}
