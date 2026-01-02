'use client';

import { useState, useEffect } from 'react';
import {
    ChevronLeftIcon,
    FileTextIcon,
    AlertCircleIcon,
    LinkIcon,
    CheckSquareIcon,
    ClockIcon,
    GitBranchIcon
} from 'lucide-react';
import Link from 'next/link';

interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface TaskDocument {
    id: string;
    title: string;
    url: string;
    type: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    hours: number | null;
    status: string;
    branch: string | null;
    aiPrompt: string | null;
    issues: string | null;
    subtasks: SubTask[];
    documents: TaskDocument[];
}

type TabType = 'description' | 'issues' | 'documents' | 'todo';

export default function TaskDetail({ taskId }: { taskId: string }) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('description');

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`/api/admin/tasks/${taskId}`);
                const data = await res.json();
                if (data.success) {
                    setTask(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch task:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [taskId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <p className="text-gray-400">Task not found</p>
                <Link href="/dashboard/management" className="text-blue-400 text-sm mt-4 inline-block hover:underline">
                    Back to Management
                </Link>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'description', label: 'Description', icon: FileTextIcon },
        { id: 'issues', label: 'Issues', icon: AlertCircleIcon },
        { id: 'documents', label: 'Documents', icon: LinkIcon },
        { id: 'todo', label: 'To Do', icon: CheckSquareIcon },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/management"
                        className="p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                    >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{task.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-gray-500">ID: {task.id.slice(0, 8)}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5 text-blue-400/80 font-mono">
                                <GitBranchIcon className="w-3.5 h-3.5" />
                                {task.branch || 'no-branch'}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <ClockIcon className="w-3.5 h-3.5" />
                                {task.hours || 0}h
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        task.status === 'IN PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                    {task.status}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 min-h-[400px] shadow-2xl">
                {activeTab === 'description' && (
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-white text-lg font-semibold mb-4">Task Description</h3>
                        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {task.description || 'No description provided.'}
                        </p>

                        {task.aiPrompt && (
                            <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Context</h4>
                                <p className="text-sm text-blue-300/80 italic">"{task.aiPrompt}"</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold mb-6">Identified Refinements & Issues</h3>
                        {task.issues ? (
                            <div className="space-y-3">
                                {task.issues.split('\n').filter(i => i.trim()).map((issue, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                        <AlertCircleIcon className="w-5 h-5 text-orange-500/60 shrink-0" />
                                        <p className="text-gray-300 text-sm leading-relaxed">{issue.replace(/- \[.\]/, '').trim()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-600 italic">No specific issues identified.</div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold mb-6">Related Documentation</h3>
                        {task.documents && task.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {task.documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                                    >
                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
                                            <LinkIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{doc.url}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-600 italic">No documents attached.</div>
                        )}
                    </div>
                )}

                {activeTab === 'todo' && (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold mb-6">Task Breakdown</h3>
                        {task.subtasks && task.subtasks.length > 0 ? (
                            <div className="space-y-2">
                                {task.subtasks.map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:bg-white/[0.04] transition-all">
                                        <div className={`p-1 rounded border ${sub.isCompleted ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                            <CheckSquareIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm ${sub.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                            {sub.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-600 italic">No sub-tasks defined.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
