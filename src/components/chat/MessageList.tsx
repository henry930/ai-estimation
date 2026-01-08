import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TaskBreakdown, { TaskCategory } from '../dashboard/TaskBreakdown';
import { SparklesIcon, CheckIcon, TimerIcon } from 'lucide-react';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    type?: 'text' | 'estimation';
    data?: any;
    isThinking?: boolean;
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

    const renderContent = (content: string, role: Role) => {
        if (!content && role === 'assistant') {
            return (
                <div className="flex items-center gap-2 text-purple-400 animate-pulse py-2">
                    <TimerIcon className="w-4 h-4 animate-spin-slow" />
                    <span className="text-xs font-medium uppercase tracking-widest">Architect is thinking...</span>
                </div>
            );
        }

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
                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-code:text-purple-400 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-ul:list-disc prose-ol:list-decimal">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                        </div>
                    )}

                    {proposalData && (
                        <div className="mt-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20 space-y-4 shadow-2xl">
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
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-code:text-purple-400 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-ul:list-disc prose-ol:list-decimal">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                    <div
                        key={message.id}
                        className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-4xl mx-auto`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-purple-600/20 border border-purple-500/20'
                            }`}>
                            {isUser ? (
                                <div className="text-xs font-bold text-white">U</div>
                            ) : (
                                <SparklesIcon className="w-4 h-4 text-purple-400" />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
                            <div className={`
                                ${isUser
                                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-2xl rounded-tr-sm px-5 py-3'
                                    : 'text-gray-200 px-2 py-1'
                                }
                            `}>
                                {renderContent(message.content, message.role)}

                                {message.type === 'estimation' && message.data && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h4 className="text-sm font-semibold mb-4 text-white">Visual Task Breakdown</h4>
                                        <div className="bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
                                            <TaskBreakdown categories={message.data} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
