import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import TaskBreakdown, { TaskCategory } from '../dashboard/TaskBreakdown';
import { SparklesIcon, CheckIcon } from 'lucide-react';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    type?: 'text' | 'estimation';
    data?: any;
}

export default function MessageList({
    messages,
    onApplyProposal
}: {
    messages: Message[],
    onApplyProposal?: (proposal: any) => Promise<void>
}) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const renderContent = (content: string) => {
        // Check for project update proposal
        const proposalMatch = content.match(/<PROJECT_UPDATE_PROPOSAL>([\s\S]*?)<\/PROJECT_UPDATE_PROPOSAL>/);

        if (proposalMatch) {
            const textContent = content.replace(/<PROJECT_UPDATE_PROPOSAL>[\s\S]*?<\/PROJECT_UPDATE_PROPOSAL>/, '').trim();
            let proposalData: any = null;
            try {
                proposalData = JSON.parse(proposalMatch[1].trim());
            } catch (e) {
                console.error('Failed to parse proposal JSON', e);
            }

            return (
                <div className="space-y-4">
                    {textContent && (
                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                            <ReactMarkdown>{textContent}</ReactMarkdown>
                        </div>
                    )}

                    {proposalData && (
                        <div className="mt-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20 space-y-4">
                            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                                <SparklesIcon className="w-4 h-4" />
                                Project Update Proposal
                            </div>

                            <div className="space-y-2">
                                {proposalData.groups?.map((g: any, i: number) => (
                                    <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                        <span className="font-medium text-gray-200">{g.title}</span>
                                        <span>• {g.tasks?.length || 0} tasks</span>
                                        <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded uppercase">{g.status}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => onApplyProposal?.(proposalData)}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                <CheckIcon className="w-3.5 h-3.5" />
                                Apply All Project Updates
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

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

                        {renderContent(message.content)}

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
