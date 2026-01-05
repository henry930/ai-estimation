'use client';

import { useState } from 'react';
import ChatPanel from '../dashboard/ChatPanel';

interface ContextSidebarProps {
    githubUrl?: string | null;
    onConnectRepo?: () => void;
}

export default function ContextSidebar({ githubUrl, onConnectRepo }: ContextSidebarProps) {
    const [activeTab, setActiveTab] = useState<'chat' | 'context'>('chat');

    return (
        <div className="h-full flex flex-col bg-[#050505] text-white">
            {/* Tab Header */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'chat'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('context')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'context'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Context
                </button>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
                {activeTab === 'chat' ? (
                    <ChatPanel />
                ) : (
                    <div className="h-full overflow-y-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* GitHub Context Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Target Repository</h4>
                            {githubUrl ? (
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-3 group">
                                    <GitHubIcon />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-blue-400 truncate">
                                            {githubUrl.split('/').slice(-2).join('/')}
                                        </div>
                                        <div className="text-[10px] text-gray-500">Connected</div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onConnectRepo}
                                    className="w-full py-4 px-4 rounded-xl border border-dashed border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                >
                                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <PlusIcon />
                                    </div>
                                    <span>Connect Repository</span>
                                </button>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                            <div className="flex items-center gap-2 mb-2 text-orange-400">
                                <InfoIcon />
                                <span className="text-sm font-semibold">Pro Tip</span>
                            </div>
                            <p className="text-xs text-orange-400/70 leading-relaxed">
                                Connecting a repository allows the AI to analyze existing code patterns and generate more accurate task breakdowns.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

}

function InfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
    )
}

function GitHubIcon() {
    return (
        <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}
