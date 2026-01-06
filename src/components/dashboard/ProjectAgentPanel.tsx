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
            console.error('Project Agent error:', err);
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyProposal = async (proposal: any) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/apply-proposal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposal })
            });

            if (!res.ok) throw new Error('Failed to apply proposal');

            // Add success message to chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: '✅ **Update Successful!** The project plan has been updated. Refreshing the dashboard...',
                timestamp: new Date()
            }]);

            // Reload after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            console.error('Apply error:', err);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ **Update Failed:** ${err.message}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
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
            <div className="flex-1 overflow-hidden flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-purple-500/5 rounded-full flex items-center justify-center border border-purple-500/10 mb-2">
                            <BotIcon className="w-10 h-10 text-purple-500/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white text-lg font-semibold">Project-wide AI Intelligence</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[400px] mx-auto">
                                I can update the entire project structure, refine estimations, or provide strategic suggestions based on your instructions.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-4">
                            {[
                                "Refine Project Scope",
                                "Update Estimation Hours",
                                "Suggest New Task Groups",
                                "Project Health Audit"
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickSend(suggestion)}
                                    className="px-4 py-3 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/30 hover:text-white transition-all text-left flex items-center gap-2"
                                >
                                    <SparklesIcon className="w-3 h-3 text-purple-400" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto bg-black/20">
                        <MessageList
                            messages={messages}
                            onApplyProposal={handleApplyProposal}
                        />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/40 border-t border-white/5">
                <div className="relative group max-w-4xl mx-auto">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
                    <div className="relative flex items-end gap-3 bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 focus-within:border-purple-500/50 transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type your strategic instructions or requests here..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-600 resize-none min-h-[50px] max-h-[150px] py-2 px-3"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-3 rounded-xl transition-all ${input.trim() && !isLoading
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
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                    <span className="text-[10px] text-gray-600 flex items-center gap-1.5 uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Project Context Loaded
                    </span>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1.5 uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Permissions Required for Updates
                    </span>
                </div>
            </div>
        </div>
    );
}
