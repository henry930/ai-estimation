'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
    taskId?: string;
    onTaskUpdate?: (updates: any) => void;
}

export default function ChatPanel({ taskId, onTaskUpdate }: ChatPanelProps) {
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage = { role: 'user', content: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    taskId
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ details: 'Server error' }));
                throw new Error(error.details || 'Failed to connect to AI');
            }

            // Create placeholder for assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    aiContent += chunk;

                    // Update the last message (the assistant's content)
                    setMessages(prev => {
                        const next = [...prev];
                        const lastMsg = next[next.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant') {
                            lastMsg.content = aiContent;
                        }
                        return next;
                    });
                }
            }

            // After stream finishes, check for task updates
            try {
                const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[1]);
                    if (data.action === 'update_task' && data.updates && onTaskUpdate) {
                        onTaskUpdate(data.updates);
                    }
                }
            } catch (e) {
                // Not a task update
            }

        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `🚨 Error: ${error.message || 'Something went wrong'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-white">AI Assistant</h3>
                <p className="text-xs text-gray-400">Claude 3.5 Sonnet</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p>No messages yet.</p>
                        <p className="mt-2 text-blue-400/60 font-mono text-xs">READY FOR CONTEXT</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                                : 'bg-white/5 border border-white/10 text-gray-200'
                            }`}>
                            <div className="font-bold text-[10px] opacity-40 mb-1 tracking-tighter uppercase">
                                {m.role === 'user' ? 'USER' : 'CLAUDE'}
                            </div>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <div className="flex gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-pulse" />
                                <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-auto border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? "AI is typing..." : "Talk to Claude..."}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isLoading ? '...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}
