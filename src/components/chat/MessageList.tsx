import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import TaskBreakdown, { TaskCategory } from '../dashboard/TaskBreakdown';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    type?: 'text' | 'estimation';
    data?: any;
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
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[90%] rounded-3xl px-6 py-4 transition-all duration-300 ${message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-900/20'
                            : message.role === 'assistant'
                                ? 'bg-[#121212] text-gray-200 border border-white/10 rounded-bl-sm shadow-xl'
                                : 'bg-transparent text-gray-500 text-sm justify-center w-full text-center border-none shadow-none'
                            }`}
                    >
                        {/* Role Label */}
                        {message.role !== 'system' && (
                            <div className={`text-[10px] uppercase tracking-widest font-bold mb-3 ${message.role === 'user' ? 'text-blue-200/60' : 'text-purple-400/60'}`}>
                                {message.role === 'user' ? 'User' : 'AI Architect'}
                            </div>
                        )}

                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                            <ReactMarkdown>
                                {message.content}
                            </ReactMarkdown>
                        </div>

                        {message.type === 'estimation' && message.data && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h4 className="text-sm font-semibold mb-4 text-white">Visual Task Breakdown</h4>
                                <div className="bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
                                    <TaskBreakdown categories={message.data} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
